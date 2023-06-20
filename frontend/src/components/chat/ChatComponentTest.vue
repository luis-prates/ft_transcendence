<template>
      <div class="card">
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
              <span><i class="fas fa-video"></i></span>
              <span><i class="fas fa-phone"></i></span>
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

        <div class="card-body msg_card_body">
          <ChatComponentTestStart type="start" mensagem="Ola" time="8:40 AM, Today" />
          <ChatComponentTestStart type="end" mensagem="Ola" time="8:40 AM, Today" />
          <ChatComponentTestStart type="start" mensagem="ehehehe" time="8:40 AM, Today" />
          <ChatComponentTestStart type="start" mensagem="testing" time="8:40 AM, Today" />
          <ChatComponentTestStart type="start" mensagem="lolol" time="8:40 AM, Today" />
          <ChatComponentTestStart type="start" mensagem="scroll tes asdasdasd asd asd asd asd t asd asd asdasd asd asd asdasd asd" time="8:40 AM, Today" />

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

const text = ref();

function send() {
  console.log(text.value.value);
}
</script>

<style lang="scss">

</style>
