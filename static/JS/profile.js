const create_story_url = '/create_story';
const change_data_url = '/change_data';
const add_data_on_site_url = '/add_data_on_site';
const add_comment_on_site_url = '/add_comment_on_site'
const create_new_comment_url = '/create_new_comment';

let open_storyForm_btn = document.getElementsByClassName('header_points')[0];
let open_profile_btn = document.getElementsByClassName('header_points')[2];
let appear_disappear_background = document.querySelector('.background');
let add_story_form = document.querySelector('.add_story');
let close_btn = document.querySelector('.close_btn');
let add_story_btn = document.querySelector('.add_story_btn');
let site_logo = document.querySelector('.site_logo');
let settings_points = document.querySelectorAll('.settings_points');
let edit = document.querySelectorAll('.edit');
let change_passowrd_form = document.querySelector('.change_passowrd');
let close_password_form_btn = document.querySelector('.close_password_form_btn');
let change_password_button = document.querySelector('.change_password_button');
let open_comments_button = document.getElementsByClassName('open_comments_button');
let submite_comment_button = document.getElementsByClassName('submite_comment_button');
let input_value;
let input_new_value;
let percent = 0;

function getCookie(name) { // function for getting ckookies  
    let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

window.addEventListener('scroll', function() {
    let offset = window.pageYOffset || document.documentElement.scrollTop;
    let windowHeight = document.documentElement.scrollHeight-document.documentElement.clientHeight;
    let progress = Math.floor(offset/windowHeight * 101);

    if(percent != progress){
        percent = progress;
        if(percent == 100){
            console.log('add data on site');
            const data = {
                'area': 'profile'
            }

            fetch(add_data_on_site_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.json();
            })
            .then(function(responce){
                if(responce.storys != 'faild'){
                    let storys = responce.storys;
                    let nickname = getCookie('username');
                    for(let i=0; i<storys.length; i++){
                        let story_data = storys[i];
                        let storys_container = document.querySelector('.storys');
                        console.log(story_data.storys_id)

                        storys_container.innerHTML += `
                            <div class="story" data-story_id="${story_data.storys_id}">

                                <div class="story_owner">

                                    <div class="owner_icon"><img src="" alt=""></div>
                                    <div class="owner_name">${nickname}</div>
                                    <div class="story_create_time">${story_data.date}</div>

                                </div>

                                <p>${story_data.story}</p>

                                <div class="comments_items_container">
                                    <input type="button" value="comments" class="open_comments_button">

                                    <div class="comments_container">
                                        <div class="writing_comments_attributes">
                                            <textarea class="comments_text_area" placeholder="Write new comment" id="textarea"></textarea>

                                            <div class="submite_comment_button_contaner">
                                                <input type="button" value="Comment" class="submite_comment_button">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        `
                    }

                    open_comments_button = document.getElementsByClassName('open_comments_button');
                    submite_comment_button = document.getElementsByClassName('submite_comment_button');
                    open_comment();
                    add_comment();
                }
            })
        }
    }
 });

function open_comment(){
    for(let i=0; i<open_comments_button.length; i++){
        open_comments_button[i].onclick = function(e){
            e.preventDefault();
            console.log('work');

            let close_open_comments =  open_comments_button[i].nextElementSibling;
        
            if(close_open_comments.classList.contains('comments_container_open') == false){

                const check_downloaded_comment = open_comments_button[i].closest('.comments_items_container').querySelector('.comments_container').getElementsByClassName('comment');
                console.log(check_downloaded_comment);

                if(check_downloaded_comment.length > 0 ){
                    close_open_comments.classList.add('comments_container_open');
                }else{
                    close_open_comments.classList.add('comments_container_open');
                    const story_id = open_comments_button[i].closest('.story').dataset.story_id;

                    const data = {
                        'story_id': story_id
                    }

                    fetch(add_comment_on_site_url, {method: 'POST', body: JSON.stringify(data)})
                    .then(function(responce){
                        return responce.json();
                    })
                    .then(function(json){
                        console.log(json)
                        if(json.comments_data != 'faild'){
                            const comments = json.comments_data
                            for(let comments_i=0; comments_i<comments.length; comments_i++){
                                let comment_data = comments[comments_i];
                                let comments_container = open_comments_button[i].closest('.comments_items_container').querySelector('.comments_container');

                                comments_container.innerHTML += `
                                    <div class="comment">

                                        <div class="comments_owner">

                                            <div class="owner_of_comment_icon"><img src="" alt=""></div>
                                            <div class="owner_of_comment_name">${comment_data.nickname}</div>
            
                                        </div>

                                        <p class="comment_value">${comment_data.comment}</p>

                                    </div>
                                `
                            }

                            add_comment();
                        }else{
                            console.log(json.comments_data)
                        }
                    })
                }
            }else{
                close_open_comments.classList.remove('comments_container_open');
            }
        }
    }
}

function add_comment(){
    for(let i=0; i<submite_comment_button.length; i++){
        submite_comment_button[i].onclick = function(e){
            e.preventDefault();
            console.log('click')

            const button = submite_comment_button[i];
            const textarea = button.closest(".writing_comments_attributes").querySelector('.comments_text_area');
            if(textarea.value != ''){

                const story_id = button.closest(".story").dataset.story_id
                console.log(story_id)

                const data = {
                    'comment': textarea.value,
                    'story_id': story_id
                }

                fetch(create_new_comment_url, {method: 'POST', body: JSON.stringify(data)})
                .then(function(responce){
                    return responce.text();
                })
                .then(function(text){
                    if(text == 'successful'){
                        const comment_conainer = button.closest('.comments_container');
                        console.log(comment_conainer)
                        const username = getCookie('username');
                        const comment_value = button.closest(".writing_comments_attributes").querySelector('.comments_text_area').value;
                        console.log(comment_value)

                        comment_conainer.innerHTML += `
                            <div class="comment">

                                <div class="comments_owner">

                                    <div class="owner_of_comment_icon"><img src="" alt=""></div>
                                    <div class="owner_of_comment_name">${username}</div>

                                </div>

                                <p class="comment_value">${comment_value}</p>

                            </div>
                        `
                        console.log('comment added');
                        textarea.value = '';
                        add_comment();
                    }else{
                        console.log(text)
                    }
                })
            }else{
                console.log('choto to ne tak')
            }
        }
    }
}

for(let i=0; i<settings_points.length; i++){
    if(settings_points[i].getAttribute('name') != 'password'){
        edit[i].onclick = function(){

            let input_name = settings_points[i].getAttribute('name');
            input_value = settings_points[i].value;
            console.log(input_value);

            if(settings_points[i].classList.contains('settings_points_open') == false){

                for(let edit_buttons =0; edit_buttons<edit.length; edit_buttons++){
                    if(settings_points[edit_buttons].getAttribute('name') != input_name){
                        edit[edit_buttons].classList.add('disabled_button');
                    }
                }

                settings_points[i].classList.add('settings_points_open');
                edit[i].dataset.status = 'open';
                edit[i].innerText = 'C';

                settings_points[i].oninput = function(e){

                    e.preventDefault();
            
                    let currently_input_value = e.target.value;
                    if(currently_input_value != input_value){
                        edit[i].dataset.status = 'edit';
                        edit[i].innerText = 'S';
                        input_new_value = currently_input_value;
                    }else{
                        edit[i].dataset.status = 'open';
                        edit[i].innerText = 'C';
                    }

                }

            }else{
                console.log(input_value)
                if(edit[i].dataset.status == 'edit'){

                    const data = {
                      'input_name': input_name,
                      'input_value': input_new_value  
                    }

                    fetch(change_data_url, {method: 'POST', body: JSON.stringify(data)})
                    .then(function(responce){
                        return responce.text();
                    })
                    .then(function(responce){
                        if(responce == 'successful'){
                            console.log('we have successfully changed your data');
                        }else{
                            console.log(input_value);
                            settings_points[i].value = input_value;
                            console.log(responce);
                        }
                    })
                }

                settings_points[i].classList.remove('settings_points_open');
                edit[i].dataset.status = 'close';
                input_value = '';
                input_new_value = '';
                edit[i].innerText = 'A';

                console.log(input_value);
                console.log(input_new_value);

                for(let edit_buttons=0; edit_buttons<edit.length; edit_buttons++){
                    if(settings_points[edit_buttons].getAttribute('name') != input_name){
                        edit[edit_buttons].classList.remove('disabled_button');
                    }
                }
                    
            }
        }
    }else{
        edit[i].onclick = function(){
            if(change_passowrd_form.classList.contains('change_passowrd_open') == false){
                change_passowrd_form.classList.add('change_passowrd_open');
                appear_disappear_background.classList.add('background_open');
            }
        }
    }

}

change_password_button.onclick = function(){
    let create_passowrd_input = document.getElementsByClassName('change_passowrd_ipnut')[0];
    let confirm_password_input = document.getElementsByClassName('change_passowrd_ipnut')[1];

    if(create_passowrd_input.value == confirm_password_input.value){
        if(create_passowrd_input.value.length>7 && confirm_password_input.value.length>7){
            const data = {
                'input_value': create_passowrd_input.value,
                'input_name': 'password'
            }

            fetch(change_data_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.text();
            })
            .then(function(responce){
                if(responce == 'successful'){
                    console.log('we have successfully changed your data');
                    change_passowrd_form.classList.remove('change_passowrd_open');
                    appear_disappear_background.classList.remove('background_open');
                    create_passowrd_input.value = '';
                    confirm_password_input.value = '';
                }
            })
        }else{
            alert('password too short');
        }
    }else{
        alert('password not same');
    }
}

close_password_form_btn.onclick = function(){
    if(change_passowrd_form.classList.contains('change_passowrd_open')){
        change_passowrd_form.classList.remove('change_passowrd_open');
        appear_disappear_background.classList.remove('background_open');
    }
}

open_storyForm_btn.onclick = function(){

    appear_disappear_background.classList.add('background_open');
    add_story_form.classList.add('add_story_open');
}

site_logo.onclick = function(){
    window.location.href = '/';
}

close_btn.onclick = function(){
    let input_story = document.querySelector('.input_story');
    appear_disappear_background.classList.remove('background_open');
    add_story_form.classList.remove('add_story_open');

    input_story.value = '';
}

add_story_btn.onclick = function(){
    let input_story = document.querySelector('.input_story');

    if(input_story.value.length >= 200 && input_story.value.length <= 3000){
        if(input_story.value.includes('fuck') == false){
            const data = {
                'story': input_story.value
            }

            fetch(create_story_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.json();
            })
            .then(function(responce){
                console.log(responce)
                if(responce.status == 'successful'){
                    console.log('work');

                    let storys_container = document.querySelector('.added_storys_conainer');

                    storys_container.innerHTML += `
                        <div class="story" data-story_id="${responce.story_id}">

                            <div class="story_owner">

                                <div class="owner_icon"><img src="" alt=""></div>
                                <div class="owner_name">Piter</div>
                                <div class="story_create_time">${responce.date}</div>

                            </div>

                            <p>${input_story.value}</p>

                        </div>
                    `
                    appear_disappear_background.classList.remove('background_open');
                    add_story_form.classList.remove('add_story_open');

                    input_story.value = '';
                }
            })
        }else{
            alert('hah slovil');
        }
    }else{
        alert('hah slovil');
    }
}

open_comment();
add_comment();