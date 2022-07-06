let button = document.querySelector('.confirm_button');
let redirect_login_btn = document.querySelector('.redirect_login')
let registration_url = '/register'


redirect_login_btn.onclick = function(e){
    e.preventDefault();

    window.location.href = '/login'
}
button.onclick = function(){;
    let password1 = document.getElementById('passwords').value;
    let password2 = document.getElementById('confirm_passwords').value;
    let email = document.getElementById('email').value;
    let first_name = document.getElementById('first_name').value;
    let last_name = document.getElementById('last_name').value;
    let nickname = document.getElementById('nickname').value;

    if(password1.length < 8 || password1.length < 8){
        alert('password is not ivalibly');
    }else{
        if(password1 == password2){

            if(email.includes('@')){

                if(first_name.length > 0 && last_name.length > 0 && nickname.length > 0){
                    let data = {
                        'nickname': nickname,
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': email,
                        'password': password1
                    }

                    fetch(registration_url, {method: 'POST', body: JSON.stringify(data)})
                    .then(function(responce){
                        return responce.text();
                    })
                    .then(function(responce){
                        if(responce == 'successful'){
                            window.location.href = '/'
                        }else{
                            alert('email or nickname already busy')
                        }
                    })


                }else{
                    alert('em not')
                }

            }else{
                alert('email is not avalibly')
            }

        }else{
            alert('password not ivalibly');
        }
    }
}