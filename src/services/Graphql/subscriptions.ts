export const oncreateMessages = /* GraphQL */ `
  subscription oncreateMessages($room_id: String!) {
    oncreateMessages(room_id: $room_id) {
      room_id
      body
      created_at
      entity_type
      is_deleted
      is_read
      payload
      user_id
      user_username
      message_by
      id

    }
  }
`;
export const onupdateMessages = /* GraphQL */ `
  subscription onupdateMessages($room_id: String!) {
    onupdateMessages(room_id: $room_id) {
     room_id
      body
      created_at
      entity_type
      is_deleted
      is_read
      payload
      user_id
      user_username
      message_by
      id
      

    }
  }
`;

export const onOpenApp = /* GraphQL */ `
  subscription onOpenApp($creator_id: String!) {
    onOpenApp(creator_id: $creator_id) {
      body
      created_at
      entity_type
      is_deleted
      is_read
      updated_at
      user_username
      avatar
      payload
      user_id
      coins
      room_id
      id
    }
  }
`;
