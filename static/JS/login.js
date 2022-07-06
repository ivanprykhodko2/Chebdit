let button = document.querySelector('.confirm_button');
let login_url = '/login'

button.onclick = function(){
    let nickname = document.getElementsByClassName('inputs')[0].value;
    let password = document.getElementsByClassName('inputs')[1].value;

    if(nickname.length > 0){
        if(password.length >= 8){

            data = {
              'nickname': nickname,
              'password': password  
            }

            fetch(login_url, {method: 'POST', body: JSON.stringify(data)})
            .then(function(responce){
                return responce.text();
            })
            .then(function(responce){
                if(responce == 'successful'){
                    window.location.href = '/'
                }else{
                    alert('the entered data is not correct')
                }
            })

        }else{
            alert('hah')
        }
    }else{
        alert('hah1')
    }
}
