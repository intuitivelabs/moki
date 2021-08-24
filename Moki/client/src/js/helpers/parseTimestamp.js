import storePersistent from "../store/indexPersistent";
import moment from 'moment-timezone';

export const parseTimestamp = (timestamp) => {       
        var aws = storePersistent.getState().user.aws;
        //format is stored in json file
        if (aws !== true) {
                var timeFormat = "";
                var dateFormat = "";
                if (storePersistent.getState().settings && storePersistent.getState().settings.length > 0) {
                        for (var i = 0; i < storePersistent.getState().settings[0].attrs.length; i++) {
                                if (storePersistent.getState().settings[0].attrs[i].attribute === "timeFormat") {
                                        timeFormat = storePersistent.getState().settings[0].attrs[i].value;
                                }
                                if (storePersistent.getState().settings[0].attrs[i].attribute === "dateFormat") {
                                        dateFormat = storePersistent.getState().settings[0].attrs[i].value;
                                }
                        }
                }

                var format = dateFormat + " " + timeFormat;
                return moment(timestamp).format(format);
        }
        //format is stored in user profile
        else {
                var userprefs = storePersistent.getState().profile[0].userprefs;
                var format = userprefs.date_format + " " + userprefs.time_format;

                //return moment(timestamp).format(format);
                return moment.tz(timestamp, userprefs.timezone).format(format);

        }
}