var slack = {
  postUrl:   'https://slack.com/api/chat.postMessage',
  userName:  'saiyo-botさん',
  iconEmoji: ':gori2:',
}

function myFunction() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("採用");
  var yesterday = new Date(new Date().getTime()-1000*60*60*24);
  var formattedDate = Utilities.formatDate(yesterday, "JST", "yyyy/MM/dd");
  
  var date = ""
  var apply_data = {}
  
  var recruitment_job_type = convertSheet2Json.convert("応募職種管理")
  
  for (var i = 1; i <= sheet.getLastRow(); i++) {
    var v = new Date( sheet.getRange(i,8).getValue() )
    if (v == ''){
      continue 
    }
    
    date = Utilities.formatDate(v, "JST", "yyyy/MM/dd")
    if (formattedDate != date) {
      continue 
    }
    
    var job_type      = sheet.getRange(i,3).getValue()
    var route         = sheet.getRange(i,5).getValue()
    var media         = sheet.getRange(i,6).getValue()
    var agent         = sheet.getRange(i,7).getValue()
    var name          = sheet.getRange(i,4).getValue()
    var decision      = sheet.getRange(i,9).getValue()
    var resume_url    = sheet.getRange(i,16).getValue()
    var agent_comment = sheet.getRange(i,17).getComments()
    var comment       = sheet.getRange(i,19).getValue()
    
    for ( var j=0; j < recruitment_job_type.length; j++ ) {
      if (recruitment_job_type[j].job_type == job_type) {
        if (recruitment_job_type[j].use_decision == "◯" && (decision == "☓")) {
          break
        }
        
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
        if (apply_data[channel_name] === undefined) {
          apply_data[channel_name] = []
        }
        apply_data[channel_name].push({"message":message,
                                       "channel_id":recruitment_job_type[j].channel_id,
                                       "custom_message":recruitment_job_type[j].custom_message})
        break
      }
    }
  }
  
  var slackApp = SlackApp.create(getSlackToken());
  for (key in apply_data) {
    
    var message_body = ""
    var num_apply = 0
    
    var array = apply_data[key]
    var channel_id = array[0].channel_id
    var custom_message = array[0].custom_message
    
    for (var i=0;i<array.length;i++) {
      message_body += array[i].message
      num_apply++;
    }
    slackApp.postMessage(channel_id,
                         "昨日の応募者は *"+num_apply+"人* でした。確認お願いします！ :gori2::gori2::gori2:\n" + message_body,
                         { username: slack["userName"], icon_emoji: slack["iconEmoji"]});
  }
}

function getSlackToken() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("slack token");
  return sheet.getRange(2,1).getValue()
}
