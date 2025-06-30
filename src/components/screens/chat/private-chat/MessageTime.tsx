import { Text, View } from "react-native"
import CustomIcons from "../../../../constants/CustomIcons"
import React from "react"
import dayjs from 'dayjs';
import { FontFamilies } from '../../../../styles/constants';
interface MessageTimeProps{
    userId:string,
    time:string,
    messageuserid:any
    isRead?:boolean
}
const MessageTime:React.FC<MessageTimeProps>= ({
    userId,
    time,
    messageuserid,isRead
})=>{
return(
    <View
    style={{
      alignSelf: userId === messageuserid ? 'flex-end' : 'flex-start',
      padding: 10,
      paddingTop: 10,
      paddingRight:0,
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    
    }}>
    <Text
      style={{
        color: '#B9B9BB',
        fontSize: 12,
        fontWeight: '400',
        fontFamily: FontFamilies.medium,
      }}>
      {dayjs(time).format('HH:mm')}
    </Text>
    {userId === messageuserid &&  isRead ? <CustomIcons type="DOUBLETICK" /> : null}
  </View>
)
}
export default MessageTime