// Returns a user with matched email 
const getUserByEmail = function(obj, str){
    for(let user in obj){
            if(obj[user].email === str){
                return user;
            } 
    }
}
module.exports = getUserByEmail;