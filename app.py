from flask import Flask, url_for, render_template, request, session, redirect, make_response, abort, g
import json
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash 
import mysql.connector
from mysql.connector import Error
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'fdkfe3o2jfe7kn23m00dw8o5iefd2dfmo634ion33fg33n9jkif'

def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name,
            auth_plugin='mysql_native_password'

        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")

    return connection

db_connect = create_connection('localhost', 'Cheburek', 'Lv3bc4mlbtVNTOg_', 'chedit')


def execute_read_query(connection, query):
    cursor = connection.cursor()
    result = None
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except Error as e:
        print(f"The error '{e}' occurred")

def execute_query(connection, query): # Запись в БД
     cursor = connection.cursor()
     try:
         cursor.execute(query)
         connection.commit()
         print("Query executed successfully")
     except Error as e:
         print(f"The error '{e}' occurred")

def check_free_data(nickname, email):
    if nickname != '' and email == '':
        
        check_free_nickname_sql = f'''SELECT 1 FROM `main_information` WHERE `nickname` = '{nickname}' '''
        check_free_nickname = execute_read_query(db_connect, check_free_nickname_sql)
        print(check_free_nickname)
        if check_free_nickname == []:
            return 'free'
        else:
            return 'busy'


    elif nickname == '' and email != '':
        check_free_email_sql = f'''SELECT 1 FROM `main_information` WHERE `email` = '{email}' '''
        check_free_email = execute_read_query(db_connect, check_free_email_sql)

        if check_free_email == []:
            return 'free'
        else:
            return 'busy'

    elif nickname != '' and email != '':
        check_free_nickname_sql = f'''SELECT 1 FROM `main_information` WHERE `nickname` = '{nickname}' '''
        check_free_email_sql = f'''SELECT 1 FROM `main_information` WHERE `email` = '{email}' '''

        check_free_nickname = execute_read_query(db_connect, check_free_nickname_sql)
        check_free_email = execute_read_query(db_connect, check_free_email_sql)

        if check_free_email == [] and check_free_nickname == []:
            return 'free'
        else:
            return 'busy'

    
@app.route('/')
def index():
    if 'userLogged' in session and request.cookies.get('username'):
        get_storys_sql = f'''SELECT `story` FROM `storys` ORDER BY id desc LIMIT 0, 10'''
        get_storys = execute_read_query(db_connect, get_storys_sql)

        get_storys_date_sql = f'''SELECT `date` FROM `storys` ORDER BY id desc LIMIT 0, 10'''
        get_storys_date = execute_read_query(db_connect, get_storys_date_sql)

        get_storys_id_sql = f'''SELECT `id` FROM `storys` ORDER BY id desc LIMIT 0, 10'''
        get_storys_id = execute_read_query(db_connect, get_storys_id_sql)
        
        get_nickname_id_sql = f'''SELECT `nickname_id` FROM `storys` ORDER BY id desc LIMIT 0, 10'''
        get_nickname_id = execute_read_query(db_connect, get_nickname_id_sql)

        if get_storys_id != []:
            min_storys_id = min(get_storys_id)
            storys = []
            print(min_storys_id[0])

            for i in range(len(get_storys)):

                get_storys_nickname_sql = f'''SELECT `nickname` FROM `main_information`WHERE id = {get_nickname_id[i][0]}'''
                get_storys_nickname = execute_read_query(db_connect, get_storys_nickname_sql)[0][0]

                storys_data = {
                    'story': get_storys[i][0],
                    'date': get_storys_date[i][0], 
                    'nickname': get_storys_nickname,
                    'story_id': get_storys_id[i][0]
                }
                storys.append(storys_data)
            print(storys)
            res = make_response(render_template('main.html', storys=storys))
            res.set_cookie('min_storys_id', f'{min_storys_id[0]}') 
        else:
            res = make_response(render_template('main.html'))

        return res
    else:
        return redirect(url_for('register'))

@app.route('/add_comment_on_site', methods=['POST'])
def add_comment_on_site():
    try:
        data = json.loads(request.data)
        story_id = data['story_id']

        get_comment_sql = f'''SELECT `comment` FROM `comments` WHERE `story_id` = {int(story_id)}'''
        get_comment = execute_read_query(db_connect, get_comment_sql)

        get_nickname_id_sql = f'''SELECT `nickname_id` FROM `comments` WHERE `story_id` = {int(story_id)}'''
        get_nickname_id = execute_read_query(db_connect, get_nickname_id_sql)

        comments = []

        for i in range(len(get_comment)):

            get_comment_nickname_sql = f'''SELECT `nickname` FROM `main_information` WHERE `id` = {int(get_nickname_id[i][0])}'''
            get_comment_nickname = execute_read_query(db_connect, get_comment_nickname_sql)[0][0]

            comment_data = {
                'comment': get_comment[i][0],
                'nickname': get_comment_nickname
            }

            comments.append(comment_data)

        print(comments)
        res = {
            'comments_data': comments
        }
    except ValueError:
        res = {
            'comments_data': 'faild'
        }

    return res


@app.route('/add_data_on_site', methods=['POST'])
def add_data_on_site():
    try:
        getted_min_storys_id = request.cookies.get('min_storys_id')
        data = json.loads(request.data)

        area = data['area']
        print(area)

        if area == 'profile':

            nickname_id = session['userLogged']
            print(getted_min_storys_id)

            get_storys_sql = f'''SELECT `story` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} AND `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 10'''
            get_storys = execute_read_query(db_connect, get_storys_sql)

            get_storys_date_sql = f'''SELECT `date` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} AND `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 10'''
            get_storys_date = execute_read_query(db_connect, get_storys_date_sql)

            get_storys_id_sql = f'''SELECT `id` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} AND `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 10'''
            get_storys_id = execute_read_query(db_connect, get_storys_id_sql)

            print(get_storys_date)
            print(get_storys)
            min_storys_id = min(get_storys_id)
            print(min_storys_id[0])

            storys = []

            for i in range(len(get_storys)):
                storys_data = {
                    'story': get_storys[i][0],
                    'date': get_storys_date[i][0],
                    'storys_id': get_storys_id[i][0]
                }
                storys.append(storys_data)
            print(storys)

            res = make_response({
                'storys': storys
            })
            res.set_cookie('min_storys_id', f'{min_storys_id[0]}')  
        elif area == 'main':
            print('-----------------------------------------------------------------------------')
            print(getted_min_storys_id)
            print('-----------------------------------------------------------------------------')

            get_storys_sql = f'''SELECT `story` FROM `storys` WHERE `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 50'''
            get_storys = execute_read_query(db_connect, get_storys_sql)

            get_storys_date_sql = f'''SELECT `date` FROM `storys` WHERE `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 50'''
            get_storys_date = execute_read_query(db_connect, get_storys_date_sql)

            get_storys_id_sql = f'''SELECT `id` FROM `storys` WHERE `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 50'''
            get_storys_id = execute_read_query(db_connect, get_storys_id_sql)

            get_nickname_id_sql = f'''SELECT `nickname_id` FROM `storys` WHERE `id`<{getted_min_storys_id} ORDER BY id desc LIMIT 0, 50'''
            get_nickname_id = execute_read_query(db_connect, get_nickname_id_sql)

            min_storys_id = min(get_storys_id)
            
            storys = []

            for i in range(len(get_storys)):

                get_storys_nickname_sql = f'''SELECT `nickname` FROM `main_information`WHERE id = {get_nickname_id[i][0]}'''
                get_storys_nickname = execute_read_query(db_connect, get_storys_nickname_sql)[0][0]

                storys_data = {
                    'story': get_storys[i][0],
                    'date': get_storys_date[i][0],
                    'nickname': get_storys_nickname, 
                    'story_id':get_storys_id[i][0]
                }
                storys.append(storys_data)
                
            print(storys)

            res = make_response({
                'storys': storys
            })
            res.set_cookie('min_storys_id', f'{min_storys_id[0]}') 
        
        return res
    except ValueError:
        res = {
            'storys': 'faild'
        }
        return res

@app.route('/create_story', methods=['POST'])
def createStory():
    try:
        data = json.loads(request.data)
        story = data['story']
        currently_date = datetime.datetime.now()
        date_now = f'{currently_date.day}.{currently_date.month}.{currently_date.year}'
        nickname_id = session['userLogged']

        add_new_story_sql = f''' 
            INSERT INTO
            `storys` (`nickname_id`, `date`, `story`)
            VALUES
            ({nickname_id}, '{date_now}', "{story}")
        '''
        execute_query(db_connect, add_new_story_sql)

        get_story_id_sql = f''' SELECT `id` FROM `storys` WHERE `story` = '{story}' '''
        story_id = execute_read_query(db_connect, get_story_id_sql)[0][0]

        res = {
            'date': date_now,
            'status': 'successful',
            'story_id': story_id
        }

        return res
    except ValueError:
        res = {
            'status': 'falied'
        }
        return res

@app.route('/create_new_comment', methods=['POST'])
def create_comment():
    try:
        data = json.loads(request.data)
        comment = data['comment']
        story_id = data['story_id']
        nickname_id = session['userLogged']
        print(comment)
        print(nickname_id)
        print(story_id)

        add_new_comment_sql = f''' 
            INSERT INTO
            `comments` (`nickname_id`, `story_id`, `comment`)
            VALUES
            ({nickname_id}, {story_id}, "{comment}")
        '''
        execute_query(db_connect, add_new_comment_sql)

        return 'successful'

    except ValueError:
        return 'faild'

@app.route('/change_data', methods=['POST'])
def change_data():
    try:
        data = json.loads(request.data)
        input_name = data['input_name']
        input_value = data['input_value']
        user_id = session['userLogged']
        print(user_id)

        print(input_name)
        print(input_value)

        if input_name != 'password':
            if input_name != 'email' and input_name != 'nickname':
                update_user_data_sql = f''' UPDATE `main_information` SET `{input_name}` = '{input_value}' WHERE `id` = {int(user_id)} '''
                execute_query(db_connect, update_user_data_sql)
                return 'successful'
            else:
                if input_name == 'email':
                    data_status = check_free_data('', input_value)
                    if data_status == 'free':
                        update_user_data_sql = f''' UPDATE `main_information` SET `{input_name}` = '{input_value}' WHERE `id` = {int(user_id)} '''
                        execute_query(db_connect, update_user_data_sql)
                        return 'successful'
                    else:
                        return 'email is busy'
                else:
                    data_status = check_free_data(input_value, '')
                    if data_status == 'free':
                        update_user_data_sql = f''' UPDATE `main_information` SET `{input_name}` = '{input_value}' WHERE `id` = {int(user_id)} '''
                        execute_query(db_connect, update_user_data_sql)
                        return 'successful'
                    else:
                        return 'nickname is busy'
        else:
            passowrd = generate_password_hash(input_value)
            print(passowrd)
            update_user_data_sql = f''' UPDATE `main_information` SET `{input_name}` = '{passowrd}' WHERE `id` = {int(user_id)} '''
            execute_query(db_connect, update_user_data_sql)
            return 'successful'

    except ValueError:
        return 'falied'


@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'userLogged' in session:
        return redirect(url_for('index'))
    elif request.method == 'POST':
        session.permanent = True
        data = json.loads(request.data)
        nickname = data['nickname']
        first_name = data['first_name']
        last_name = data['last_name']
        email = data['email']
        password = generate_password_hash(data['password'])

        check_empty_data = check_free_data(nickname, email)
        print(check_empty_data)

        if check_empty_data == 'free':

            add_new_profile_sql = f''' 
                INSERT INTO
                `main_information` (`nickname`, `first_name`, `last_name`, `email`, `password`)
                VALUES
                ('{nickname}', '{first_name}', '{last_name}', '{email}', '{password}')
            '''
            execute_query(db_connect, add_new_profile_sql)

            get_user_id_sql = f''' SELECT `id` FROM `main_information` WHERE `nickname` = '{nickname}' '''
            user_id = execute_read_query(db_connect, get_user_id_sql)[0][0]
            print(user_id)

            session['userLogged'] = user_id
            res = make_response('successful')
            res.set_cookie('username', f'{nickname}', 365*24*3600)

            return res
        else:
            print('work')
            return 'data already busy'

    return render_template('registration.html')



@app.route('/login', methods=['GET', 'POST'])
def login():

    if 'userLogged' in session:
        return redirect(url_for('index'))
    elif request.method == 'POST':
        session.permanent = True
        data = json.loads(request.data)
        nickname = data['nickname']
        password = data['password']
        print(nickname)
        print(password)

        check_include_nickname_sql = f'''SELECT `id` FROM `main_information` WHERE `nickname` = '{nickname}' '''
        check_include_nickname = execute_read_query(db_connect, check_include_nickname_sql)[0][0]
        print(check_include_nickname)

        get_password_sql = f'''SELECT `password` FROM `main_information` WHERE `id` = {int(check_include_nickname)} '''
        db_password = execute_read_query(db_connect, get_password_sql)[0][0]
        print(db_password)


        check_password_status = check_password_hash(db_password, password)
        print(check_password_status)

        if check_include_nickname != [] and check_password_status == True:

            session['userLogged'] = check_include_nickname
            res = make_response('successful')
            res.set_cookie('username', f'{nickname}', 365*24*3600)
            return res
        else:
            return 'falied'
    return render_template('login.html')


@app.route('/profile/<username>', methods=['GET'])
def profile(username):
    if request.cookies.get('username') and 'userLogged' in session:
        getted_nickname = request.cookies.get('username')
        nickname_id = session['userLogged']
        print(getted_nickname)

        get_first_name_sql = f'''SELECT `first_name` FROM `main_information` WHERE `nickname` = '{getted_nickname}' '''
        get_first_name = execute_read_query(db_connect, get_first_name_sql)[0][0]

        get_last_name_sql = f'''SELECT `last_name` FROM `main_information` WHERE `nickname` = '{getted_nickname}' '''
        get_last_name = execute_read_query(db_connect, get_last_name_sql)[0][0]

        get_email_sql = f'''SELECT `email` FROM `main_information` WHERE `nickname` = '{getted_nickname}' '''
        get_email = execute_read_query(db_connect, get_email_sql)[0][0]

        get_storys_sql = f'''SELECT `story` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} ORDER BY id desc LIMIT 0, 10'''
        get_storys = execute_read_query(db_connect, get_storys_sql)

        get_storys_date_sql = f'''SELECT `date` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} ORDER BY id desc LIMIT 0, 10'''
        get_storys_date = execute_read_query(db_connect, get_storys_date_sql)

        get_storys_id_sql = f'''SELECT `id` FROM `storys` WHERE `nickname_id` = {int(nickname_id)} ORDER BY id desc LIMIT 0, 10'''
        get_storys_id = execute_read_query(db_connect, get_storys_id_sql)
        print(get_storys_date)
        print(get_storys)
        if get_storys_id != []:
            min_storys_id = min(get_storys_id)
            print(min_storys_id[0])
            storys = []

            for i in range(len(get_storys)):

                storys_data = {
                    'story': get_storys[i][0],
                    'date': get_storys_date[i][0],
                    'story_id': get_storys_id[i][0]
                }
                storys.append(storys_data)

            if username == getted_nickname:
                print('work')
                res = make_response(render_template('profile.html', nickname=getted_nickname, first_name=get_first_name,last_name=get_last_name, email=get_email, storys=storys))
                res.set_cookie('min_storys_id', f'{min_storys_id[0]}')
            else:
                res = '<h1>this is not your acaunt</h1>'
        else:
            if username == getted_nickname:
                res = make_response(render_template('profile.html', nickname=getted_nickname, first_name=get_first_name,last_name=get_last_name, email=get_email))
            else:
                res = '<h1>this is not your acaunt</h1>'
        return res
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True)