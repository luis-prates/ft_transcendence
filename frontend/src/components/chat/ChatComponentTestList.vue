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
        <div class="card-body contacts_body">
          <ul class="contacts">
            <li class="active">
              <div class="d-flex bd-highlight">
                <div class="img_cont">
                  <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img">
                  <span class="online_icon"></span>
                </div>
                <div class="user_info">
                  <span>jassa</span>
                  <p>Kalid is online</p>
                </div>
              </div>
            </li>
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
            
            <!-- Add more list items here -->
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