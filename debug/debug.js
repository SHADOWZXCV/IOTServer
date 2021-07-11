function CONSOLE(text){
    console.log( new Date().toString().split('(')[0] + " |" + text)
    return
}

module.exports = {
    CONSOLE
}