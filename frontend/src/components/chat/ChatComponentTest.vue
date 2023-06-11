<template>
      <div v-if="channelStatus" class="card">
        <div class="card-header msg_head">
          <div class="d-flex bd-highlight">
            <div class="img_cont">
              <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img" />
            </div>
            <div class="user_info">
              <span>Chat with jassa</span>
              <p>1767 Messages</p>
            </div>
            <div class="video_cam">
              <button class="config_chat">⚙</button>
              <button  @click="toggleStatus" class="close_chat">✖</button>
            </div>
          </div>

          
          <!-- <span id="action_menu_btn"><i class="fas fa-ellipsis-v"></i></span>
             <div class="action_menu">
               <ul>
                 <li><i class="fas fa-user-circle"></i> View profile</li>
                 <li><i class="fas fa-users"></i> Add to close friends</li>
                 <li><i class="fas fa-plus"></i> Add to group</li>
                 <li><i class="fas fa-ban"></i> Block</li>
               </ul>
             </div> -->
        </div>

        <div class="card-body msg_card_body" ref="scrollContainer">
          <ChatComponentTestStart type="start" mensagem="." time="8:40 AM" />
          <ChatComponentTestStart type="end" mensagem="Ola" time="8:40 AM" />
          <ChatComponentTestStart type="start" mensagem="ehehehe" time="8:40 AM" />
          <ChatComponentTestStart type="start" mensagem="testing" time="8:40 AM" />
          <ChatComponentTestStart type="start" mensagem="lolol" time="8:40 AM" />
          <ChatComponentTestStart type="start" mensagem="scroll tes asdasdasd asd asd asd asd t asd asd asdasd asd asd asdasd asd" time="8:40 AM" />

        </div>

        <div class="card-footer">
          <div class="input-group">
            <textarea ref="text" name="" class="form-control type_msg" placeholder="Type your message..." style="resize: none;"></textarea>
            <div class="input-group-append">
              <span class="input-group-text send_btn" @click="send"><i class="fas fa-location-arrow"></i>➤</span>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
//Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";
import { ref } from "vue";
import ChatComponentTestStart from "./ChatComponentTestStart.vue";
import { defineProps, getCurrentInstance, watch } from 'vue';


// Props declaration
const props = defineProps({
  channelStatus: Boolean
});

// Get the current component instance
const instance = getCurrentInstance();

// Emit event from the child component
const toggleStatus = () => {
  console.log("Valor do status: " + props.channelStatus);
 const newStatus = !props.channelStatus;
 instance?.emit('update-channel-status', newStatus);
};

const text = ref();

function send() {
  console.log(text.value.value);
}

const scrollContainer = ref<HTMLElement | null>(null);

watch(() => scrollContainer.value, (newContainer) => {
  if (newContainer) { 
    scrollToBottom();
  }
});

function scrollToBottom() {
  const container = scrollContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
    console.log("SCROLL FUNCTION");
  }
}
</script>

<style lang="scss">

</style>
