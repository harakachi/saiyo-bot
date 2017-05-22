var slack = {
  postUrl:   'https://slack.com/api/chat.postMessage',
  userName:  'saiyo-botさん',
  iconEmoji: ':gori2:',
}

function myFunction() {
  var sheet = convertSheet2Json.convert("採用")
  var recruitment_job_type = convertSheet2Json.convert("応募職種管理")
  
  var apply_data = {}
  
  //var today = new Date(new Date().getTime()-1000*60*60*24);
  var today = new Date();
  var formattedDate = Utilities.formatDate(today, "JST", "yyyy/MM/dd");
  
  for (var i=0; i < sheet.length; i++ ) {
    if (sheet[i].confirm_date == "") continue
    var v = new Date( sheet[i].confirm_date )
    
    var date = Utilities.formatDate(v, "JST", "yyyy/MM/dd")
    if (formattedDate != date) continue 

    var job_type      = sheet[i].job_type
    var route         = sheet[i].route
    var media         = sheet[i].media
    var agent         = sheet[i].agent
    var name          = sheet[i].name
    var decision      = sheet[i].decision
    var resume_url    = sheet[i].resume_url
    var agent_comment = sheet[i].agent_comment
    var comment       = sheet[i].comment
    
    for ( var j=0; j < recruitment_job_type.length; j++ ) {
      if (recruitment_job_type[j].job_type == job_type) {
        if (recruitment_job_type[j].use_decision == "◯" && (decision == "☓")) break
        
        var message = "```\n" 
              + "名前: " 　　　　　　　　　+ name + "\n"
              + "応募職種:" 　　　　+ job_type + "\n"
              + "経路:" 　　　　　　　　　　　+ route + "\n"
              + "媒体:" 　　　　　　　　　　　+ media + "\n"
              + "エージェント:" 　+ agent + "\n"
              + "申し送り事項:\n===========\n"　　+ agent_comment + "\n" + "===========\n" 
              + "履歴書URL:" 　　+ resume_url +"\n"
              + "大友判断：" 　　　　　+ decision + "\n"
              + "大友コメント:" 　+ comment + "\n"
              + "```\n"  
        
        var channel_name = recruitment_job_type[j].channel_name
        if (apply_data[channel_name] === undefined) apply_data[channel_name] = []
        
        apply_data[channel_name].push({"message":message,
                                       "channel_id":recruitment_job_type[j].channel_id,
                                       "custom_message":recruitment_job_type[j].custom_message})
        break
      }
    }
  }
  post2Slack(apply_data)
}
  
function post2Slack(apply_data) {
  
  var slackApp = SlackApp.create(getSlackToken());
  for (key in apply_data) {
    
    var message_body = ""
    var num_apply = 0
    
    var array = apply_data[key]
    var channel_id = array[0].channel_id
    var custom_message = array[0].custom_message
    
    var default_message = "確認お願いします！ :gori2::gori2::gori2:"
    var msg = (custom_message) ? custom_message : default_message
    msg += "\n"
    
    for (var i=0;i<array.length;i++) {
      message_body += array[i].message
      num_apply++;
    }
    slackApp.postMessage(channel_id,
                         "昨日の応募者は *"+num_apply+"人* でした。 " + msg + message_body,
                         { username: slack["userName"], icon_emoji: slack["iconEmoji"]});
  }
}

function getSlackToken() {
  var sheet = convertSheet2Json.convert("slack token")
  return sheet[0].slack_token
}
