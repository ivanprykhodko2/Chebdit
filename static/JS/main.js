const create_story_url = '/createStory';
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
let open_comments_button = document.getElementsByClassName('open_comments_button');
let submite_comment_button = document.getElementsByClassName('submite_comment_button');
let percent = 0;

function getCookie(name) { // функция для куки 
    let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

open_storyForm_btn.onclick = function(){

    appear_disappear_background.classList.add('background_open');
    add_story_form.classList.add('add_story_open');
}

site_logo.onclick = function(){
    window.location.href = '/';
}

open_profile_btn.onclick = function(){

    let username = getCookie('username')
    
    window.location.href = `/profile/${username}`;
}

close_btn.onclick = function(){
    let input_story = document.querySelector('.input_story');
    appear_disappear_background.classList.remove('background_open');
    add_story_form.classList.remove('add_story_open');

    input_story.value = '';
}

window.addEventListener('scroll', function() {
    let offset = window.pageYOffset || document.documentElement.scrollTop
    let windowHeight = document.documentElement.scrollHeight-document.documentElement.clientHeight
    let progress = Math.floor(offset/windowHeight * 101);

    if(percent != progress){
        percent = progress
        if(percent == 100){
            console.log('add data on site')

            let data = {
                'area': 'main'
            }

            fetch(add_data_on_site_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.json();
            })
            .then(function(responce){
                console.log(responce)
                if(responce.storys != 'faild'){
                    let storys = responce.storys
                    console.log(storys)
                    for(let i=0; i<storys.length; i++){
                        let story_data = storys[i]

                        let storys_container = document.querySelector('.main_stories');

                        storys_container.innerHTML += `
                            <div class="story" data-story_id="${story_data.story_id}">

                                <div class="story_owner">

                                    <div class="owner_icon"><img src="" alt=""></div>
                                    <div class="owner_name">${story_data.nickname}</div>
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


add_story_btn.onclick = function(){
    let input_story = document.querySelector('.input_story');

    if(input_story.value.length >= 200 && input_story.value.length <= 3000){
        if(input_story.value.includes('fuck') == false){
            let data = {
                'story': input_story.value
            }

            fetch(create_story_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.json();
            })
            .then(function(responce){
                if(responce.status == 'successful'){

                    let main_stories_container = document.querySelector('.added_storys_conainer');
                    
                    main_stories_container.innerHTML += `
                        <div class="story" data-story_id="${responce.story_id}">

                            <div class="story_owner">

                                <div class="owner_icon"><img src="" alt=""></div>
                                <div class="owner_name">Piter</div>
                                <div class="story_create_time">${responce.date}</div>

                            </div>

                            <p>${input_story.value}</p>

                        </div>
                    `

                    appear_disappear_background.classList.remove('background_open')
                    add_story_form.classList.remove('add_story_open')

                    input_story.value = '';
                }else{
                    console.log(responce.status)
                }
            })
        }else{
            alert('hah slovil')
        }
    }else{
        alert('hah slovil')
    }
}

open_comment();
add_comment();