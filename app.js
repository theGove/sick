const gas_deployment_id='AKfycbzskEB3QADF7xc30AmqPbL1ppofxvnfXDHKmY0Pactvf-CvrFo7f1ph8RJn26fQR-39nQ'
const gas_end_point = 'https://script.google.com/macros/s/'+gas_deployment_id+'/exec'


async function server_request(payload, callback){ 
    //This function is used to invoke a function in Google App Script to interact with Airtable. This is desireable so that we can isolate the information needed to interact with the data from the client browser.
    //if a callback is not provided  this function waits until the call is complete
    tag("working").style.display="block"
    console.log("const payload=`" + JSON.stringify(payload) + "`")//This is primarily useful for troubleshooting. The data passed to Google App Script is sent to the console.
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
    tag("netid").focus()

}

function valid_input(){
    const byuid = tag("byuid").value.replace(/\D/g,'')// remove all non-numeric characters.
    console.log(byuid, byuid.length)
    if(byuid.length!==9){
        message({
            title:"Error",
            message:"Your BYU ID must be 9 digits long",
            kind:"error",
            seconds:5
        }) 
        return false
    }

    if(tag("netid").value.length===0){
        message({
            title:"Error",
            message:"Net ID is required",
            kind:"error",
            seconds:5
        }) 
        return false
    }

    return true
}

async function get_form(){
    if(!valid_input()){return}
    const pw=await hash_string(tag("pw").value+tag("netid").value)
    response = await server_request({
        mode:"get_data",
        netid:tag("netid").value,
        byuid:tag("byuid").value.replace(/\D/g,''),
        pw:pw,
    })

    if(response.error){
        message({
            title:"Error",
            message:response.error,
            kind:"error",
            seconds:8
        }) 
    }
    const html=[`<table align="center"><tr><td colspan="2"><div style="margin-bottom:.5rem">Enter as many or as few as desired. <br> You can make changes later.</div></td></tr>`]
    for(const item of response){
        let val=""
        if(item.value){val=item.value}
        html.push(`<tr><td>${item.label}</td><td><input id="${item.name}" value="${val}"></td></tr>`)
    }
    html.push(`</table><button onclick="send_data()">Update</button>`)
    tag("canvas").innerHTML=html.join("")
}


async function send_data(){
    if(!valid_input()){return}
    


    const body={mode:"update_data"}
    for(const elem of document.getElementsByTagName("input")){
      if(elem.value!==undefined){  
        body[elem.id]=elem.value
      }
    }

    body.pw=await hash_string(tag("pw").value+tag("netid").value)
    body.byuid=body.byuid.replace(/\D/g,'')

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

function toggle(id){
    if(tag(id).style.display==="none"){
        tag(id).style.display="block"
    }else{
        tag(id).style.display="none"
    }
}

async function hash_string(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  }


  async function debug(){
    const json={google_account:"adammurray.byu@gmail.com",oracle_url:"https://gf56c5204eb5820-tpdb.adb.us-sanjose-1.oraclecloudapps.com/ords/professor/_sdw/",ip_address:"35.233.140.191"}
    const options = { 
            method: "POST", 
            body: "entry.1280202215=oracle_url_submitted&entry.926999823=" + encodeURIComponent(JSON.stringify(json)),
            mode:"no-cors",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              },
        }
    let apiResponse = await fetch('https://docs.google.com/forms/u/0/d/e/1FAIpQLSergBWhPaI7hsv5Udl-oPo3tv6Kw_dHL--20xq4e4AWX3LBFQ/formResponse',options);
    let data = await apiResponse.text();
  }