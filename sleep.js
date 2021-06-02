async function waiting_for_response(delay){
    const sleep = (delay)=> new Promise((resolve)=> setTimeout(resolve,delay))
     await sleep(delay);

}

module.exports = waiting_for_response
