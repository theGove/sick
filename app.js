const gas_deployment_id='AKfycbzskEB3QADF7xc30AmqPbL1ppofxvnfXDHKmY0Pactvf-CvrFo7f1ph8RJn26fQR-39nQ'
const gas_end_point = 'https://script.google.com/macros/s/'+gas_deployment_id+'/exec'


async function server_request(payload, callback){ 
    //This function is used to invoke a function in Google App Script to interact with Airtable. This is desireable so that we can isolate the information needed to interact with the data from the client browser.
    //if a callback is not provided  this function waits until the call is complete
    tag("working").style.display="block"
    //console.log("const payload=`" + JSON.stringify(payload) + "`")//This is primarily useful for troubleshooting. The data passed to Google App Script is sent to the console.
    //The request for Google App Script is formatted.
    const options = { 
        method: "POST", 
        body: JSON.stringify(payload),
    }

    if(callback){// execute the requst and let callback handle the response
        fetch(gas_end_point, options)
        .then(response => response.json())
        .then(callback);
        tag("working").style.display="none"
    
    }else{ //execute the request and wait for the response so it can be returned
        const reply = await fetch(gas_end_point, options)
        //The request is made of Google App Script and the response is set to "response"
        const response = await reply.json()


        //console.log("in post data", response)     
        tag("working").style.display="none"
        return response
    }
}



async function initialize_app(){ 
    //This function initializes the page when it is loaded.
    //tag("canvas").innerHTML="Howdy"

}

async function get_form(){
    const byuid = tag("byuid").value
    //console.log(byuid, byuid.length)
    if(byuid.length!==9){
        message({
            title:"Error",
            message:"Your BYU ID must be 9 digits long",
            kind:"error",
            seconds:5
        }) 
        return
    }

    if(tag("netid").value.length===0){
        message({
            title:"Error",
            message:"Net ID is required",
            kind:"error",
            seconds:5
        }) 
        return
    }

    

    response = await server_request({
        mode:"get_data",
        netid:tag("netid").value,
        byuid:byuid,
        pw:tag("pw").value,
    })

    if(response.error){
        message({
            title:"Error",
            message:response.error,
            kind:"error",
            seconds:8
        }) 
    }
    const html=[`<table align="center"><tr><td colspan="2">Enter as many or as few as desired. <br> You can make changes later.</td></tr>`]
    for(const item of response){
        let val=""
        if(item.value){val=item.value}
        html.push(`<tr><td>${item.label}</td><td><input id="${item.name}" value="${val}"></td></tr>`)
    }
    html.push(`</table><button onclick="send_data()">Update</button>`)
    tag("canvas").innerHTML=html.join("")
}


async function send_data(){
    const byuid = tag("byuid").value
    //console.log(byuid, byuid.length)
    if(byuid.length!==9){
        message({
            title:"Error",
            message:"Your BYU ID must be 9 digits long",
            kind:"error",
            seconds:5
        }) 
        return
    }

    if(tag("netid").value.length===0){
        message({
            title:"Error",
            message:"Net ID is required",
            kind:"error",
            seconds:5
        }) 
        return
    }



    const body={mode:"update_data"}
    for(const elem of document.getElementsByTagName("input")){
      if(elem.value!==undefined){  
        body[elem.id]=elem.value
      }
    }
    //console.log(body)
    response = await server_request(body)
    if(response.error){
        message({
            title:"Error",
            message:response.error,
            kind:"error",
            seconds:8
        }) 
    }else{
        message({
            title:"Success",
            message:"Your data has been recorded",
            seconds:3
        }) 
    }

}




function message(parameters){
    //returns a reference to the message created
    // Example parameters{
    //     message:"Password must contain at least one Capital letter",
    //     title:"User Error",
    //     kind:"error",
    //     seconds:4
    // }
    let params
    if(typeof parameters==="string"){
        params={
            message:parameters
        }
    }else{
        params=parameters
    }

    if(!params.title){params.title="Message"}
    if(!params.seconds){params.seconds=0}

    
    let message_class="msg-head"
    if(params.kind==="error"){
        message_class += " error"
        if(params.title==="Message"){
            params.title="Error"
        }
    }else if(params.kind==="info"){
        message_class += " info"
    }
    const msg=document.createElement("div")
    msg.className="message"
    msg.innerHTML=`
    <div class="${message_class}">
      ${params.title}
      <div class="msg-ctrl">
      <i class="fas fa-times" onclick="this.parentElement.parentElement.parentElement.remove()" style="cursor: pointer;"></i>
      </div>
    </div>
    <div class="msg-body">
    ${params.message}
    </div>`
    if(params.seconds>0){
      setTimeout(function(){msg.remove()},params.seconds*1000)
    }
    tag("message-center").appendChild(msg)
    return msg

}










function tag(id){
    //Adds an ID to an HTML element
    return document.getElementById(id)
}

function toggle(tag_or_id,display="block"){log(2,arguments,filename,toggle)
    
    
    let element=tag_or_id
    if(!element.tagName){
        // assume caller passed in a tag id, as tag_or_id 
        // does not have a tag name it cannot be a tag
        element=tag(tag_or_id)
    }

    //console.log("element", element)
    if(element.style && element.style.display===display){
        element.style.display="none"
        return false
    }else{
        element.style.display=display
        return true
    }
}
