
  import { ref, watch, getCurrentInstance } from 'vue';
  import { chatStore, type channel, type ChatUser } from "@/stores/chatStore";
  import { storeToRefs } from "pinia";
  import { userStore } from "@/stores/userStore";

  export class Menu
  {

  
  store = chatStore()
  selected = storeToRefs(chatStore()).selected;
  // Get the current component instance
  instance = getCurrentInstance();

  Menu()
  {

  }
  
  isMenuOpen = ref(false);
  mouseX = ref(0);
  mouseY = ref(0);
  
//   props = defineProps({
//   channel: {
//     type: Object as () => channel, // Specify the type as channel
//     required: false,
//   },
//   user: {
//     type: Object as () => ChatUser, // Specify the type as channel
//     required: false,
//   },
// });

sendDM = async (user : ChatUser) => {
  const userID = user.id;
  console.log("Tamanho dos channels: ", this.store.channels.length);
  console.log("Os channels: ", this.store.channels);
  const channelExist = this.store.channels.find((channelStore: channel) => channelStore.type == "DM" 
  && channelStore.users.some((userChannel: ChatUser) => userChannel.id == userStore().user.id)
  && channelStore.users.some((userChannel: ChatUser) => userChannel.id == userID));
      
  if (channelExist)
  {
    console.log("This DM is already exist!");
    return channelExist;
  }
  else
  {
    console.log(" DM NÃO exite por isso vai criar uma!");
    try {
      const newChannel = {
        objectId: 1,
        name: "DM",
        avatar: "",
        password: "",
        messages: [],
        users: [] as any,
        type: "DM",
        banList: [] as any,
      };
      newChannel.users.push(user.id);
      
      const response = await this.store.createChannel(newChannel);
      
      if (!response) {
        console.log("Erro inesperado!");
        return response;
      } else if (response == "409"){
        console.log('Failed to create DM. DM already exists');
        return false;
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return false;
}
};

  handleMenuItemUserClick = (item: number, user: ChatUser) => {
    if (!user)
      return ;
    //Send DM
    if (item == 0) {
      //se DM ja existir entre players abre o chat
      //else
      this.sendDM(user);
    }
    //Open Menu
    if (item == 1) {
      this.instance?.emit('openPerfilUser', user);
    }
    //Friends
    else if (item == 2){
      const label = this.getFriend(user);
      if (label == "Add Friend")
        userStore().sendFriendRequest(user.id, user.nickname);
      else if (label == "Cancel Request")
        userStore().cancelFriendRequest(user.id);
      else if (label == "You have a Request")
        return ;
      else if (label == "Remove Friend")
        userStore().deleteFriend(user.id);
    }
    // Block
    else if (item == 3){
      const label = this.getBlock(user);
      if (label == "Block")
        userStore().blockUser(user.id, user.nickname, user.image);
      else if (label == "UnBlock")
        userStore().unblockUser(user.id);
    }
    // Change
    else if (item == 4){
     this.getChallenge(user)
    }
    // Mute or Unmute
    else if (item == 5){
      this.instance?.emit('muteOrUnmute', user);
    }
    // Kick
    else if (item == 6){
      this.instance?.emit('kickUser', user);
    }
    // Ban
    else if (item == 7){
      if (this.selected)
      this.store.banUser(this.selected?.value.objectId, user.id, "ban");
    }
    //GIVE ADMINSTRATOR
    else if (item == 8){
      this.instance?.emit('makeOrDemoteAdmin', user);
    }
    if (this.isMenuOpen)
      this.toggleMenu();
  };

  getOpenJoin(){
    if (this.store.isUserInSelectedChannel(userStore().user.id))
    return "Open";
    return "Join";
  };

  isAdmin(userChat: ChatUser, mute?: boolean) {
    const channel = chatStore().channels.find((chat: channel) => chat.objectId == this.store.selected.objectId)
    if (!channel)
      return false;
    const myId = userStore().user.id;
    if (myId == channel.ownerId)
      return true;
    const userId = userChat?.id;
    const iAmInChannel = channel.users.find((userChat: ChatUser) => userChat.id == myId);
    if (iAmInChannel && iAmInChannel.isAdmin && userId != channel.ownerId)
    {
      if (!mute)
      {
        const userInChannel = channel.users.find((userChat: ChatUser) => userChat.id == userId);
        if (userInChannel && userInChannel.isAdmin)
          return false;
      }
      return true;
    }
    return false;
  }

  getFriend(chatUser: ChatUser){
    let index = userStore().user.friends.findIndex(user => user.id == chatUser.id);
    const isYourFriend = index == -1 ? false : true;

    index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requestorId === chatUser.id);
		const heSendARequestFriend = index == -1 ? false : true;
    
		index = userStore().user.friendsRequests.findIndex((friendship) => friendship.requesteeId === chatUser.id);
    const yourSendAFriendRequest = index == -1 ? false : true;
    
    return isYourFriend ? "Remove Friend" : (heSendARequestFriend ? "You have a Request" : (yourSendAFriendRequest ? "Cancel Request" : "Add Friend"));
  };

  getBlock(chatUser: ChatUser){
    const userIndex = userStore().user.block.findIndex(block => block.blockedId == chatUser.id);
    if (userIndex !== -1) {
      return "UnBlock"
    }
    return "Block";
  };

  getChallenge(chatUser: ChatUser){
    userStore().challengeUser(chatUser.id, chatUser.nickname);
  };

  getMute(chatUser: ChatUser){
    if (chatUser.isMuted)
      return "UnMute";
    else
      return "Mute";
  };
  
  getAdmistrator(chatUser: ChatUser){
    if (chatUser.isAdmin)
      return "Remove";
    else
      return "Give";
  };

  toggleMenu = () => {
    this.isMenuOpen.value = !this.isMenuOpen.value;
    this.instance?.emit('toggleMenu');
  };
  
  handleMenuItemClick = (item: number, channel: channel) => {
    // Handle menu item click logic
    if (item == 1) {
      this.instance?.emit('openChannel', channel);
    }
    else if (item == 2){
      console.log("O id do channel onde vai dar elave: ", this.selected.value.objectId)
      this.store.leaveChannel(this.selected.value.objectId);
    }
    if (this.isMenuOpen)
      this.toggleMenu();
  };

  
};