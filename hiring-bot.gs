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
    var comment       = sheet.getRange(i,20).getValue()
    var channel_name  = sheet.getRange(i,18).getValue()
      
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

    // 特例対応
    if ( job_type.match("FJ") && (decision == "☓")) {
      continue
    }
      
    // チャンネル名ごとに振り分け
    if (apply_data[channel_name] === undefined) {
      apply_data[channel_name] = []
    }
    apply_data[channel_name].push(message)
  }
  
  Logger.log(getSlackToken())
  
  var slackApp = SlackApp.create(getSlackToken());
  
  var channel_data = getSlackCannels()
  for (key in channel_data) {
    var apply_array = apply_data[key]
    if (apply_array === undefined) {
      //対象channel向けの報告対象がいない。これも通知してあげると良いのかな?
      continue
    }
    
    var post_channel = channel_data[key]
    var num_apply = apply_array.length
    var message_body = "";
    for (var i = 0; i < apply_array.length; i++) {
  　　　　　　　 message_body += apply_array[i];
　　　　　　　　};
    slackApp.postMessage(post_channel,
                         "昨日の応募者は *"+num_apply+"人* でした。確認お願いします！ :gori2::gori2::gori2:\n" + message_body,
                         { username: slack["userName"], icon_emoji: slack["iconEmoji"]});
  }
}

function getSlackToken() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("チャンネル一覧");
  return sheet.getRange(2,3).getValue()
}

function getSlackCannels() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("チャンネル一覧");
  var data = {}
  for (var i = 2; i < sheet.getLastRow()+1; i++) {
    var key = sheet.getRange(i,1).getValue()
    var value = sheet.getRange(i,2).getValue()
    data[ key ] = value
  }
  return data
}
