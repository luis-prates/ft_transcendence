<template>
  <div class="parent-container">
      <div class="card mb-sm-3 mb-md-0 contacts_card">
        <div class="card-header">
          <div class="input-group">
            <input type="text" placeholder="Search..." name="" class="form-control search">
            <div class="input-group-prepend">
              <span class="input-group-text search_btn">+<i class="fas fa-search"></i></span>
            </div>
          </div>
        </div>
        <div v-if="props.chat == false" class="card-body contacts_body">
          <!-- Add chat list items here -->
          <div class="chat_filter">
            <button class="chat_filter_button">💬</button>
            <button class="chat_filter_button">🌐</button>
          </div>
          <ul class="contacts">
            <li>
              <div class="d-flex bd-highlight">
                <div class="img_cont">
                  <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img">
                  <span class="online_icon offline"></span>
                </div>
                <div class="user_info">
                  <span>jassa</span>
                  <p>Taherah left 7 mins ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div v-else class="card-body contacts_body">
          <!-- Users inside the chat selected -->
          <ul class="contacts">
            <li>
              <div class="d-flex bd-highlight">
                <div class="img_cont">
                  <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img">
                  <span class="online_icon offline"></span>
                </div>
                <div class="user_info">
                  <span>jassa</span>
                  <p>Taherah left 7 mins ago</p>
                </div>
              </div>
            </li>
          </ul>
      </div>
      </div>
  </div>
</template>

 <script setup lang="ts">
 //Bootstrap
 import 'bootstrap/dist/css/bootstrap.min.css';
 import 'bootstrap/dist/js/bootstrap.min.js';
 import './App.css';
 import { defineProps } from "vue";

 const props = defineProps({
  chat: Boolean,
})

 </script>

<style>
.parent-container {
  height: 100%;
  display: flex;
  justify-content: flex-end;
}

.contacts_card {
  flex: 1;
  max-height: 100%; /* Set the desired maximum height for the contacts card */
  overflow-y: auto;
}
</style>