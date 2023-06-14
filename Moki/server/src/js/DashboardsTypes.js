    var getDashboardTypes = function(name) {
        switch(name){
          case 'calls': 
                return ["call-end", "call-start", "call-attempt"];
        case 'overview': 
                return ["call-end", "call-start", "call-attempt", "reg-new", "reg-del", "reg-expired", "notice", "auth-failed", "log-reply", "action-log", "message-log", "fbl-new", "error", "alert", "fgl-new", "prompt", "limit", "Recording", "message-dropped"];
        case 'registration': 
                return [ "reg-del", "reg-new", "reg-expired"];
        case 'diagnostics': 
                return ["alert", "error", "message-log", "action-log", "prompt", "recording", "notice"];
    }
}

    export default {
        getDashboardTypes: getDashboardTypes
    };
  
