<template>
  <div>
     <div class="row justify-content-center h-100">
       <div class="col-md-4 col-xl-3 chat"><div class="card mb-sm-3 mb-md-0 contacts_card">
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
           <!-- <li>
             <div class="d-flex bd-highlight">
               <div class="img_cont">
                 <img src="https://therichpost.com/wp-content/uploads/2020/06/avatar2.png" class="rounded-circle user_img">
                 <span class="online_icon"></span>
               </div>
               <div class="user_info">
                 <span>jassa Mann</span>
                 <p>Sami is online</p>
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
                 <span>jassa Mann</span>
                 <p>Nargis left 30 mins ago</p>
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
                 <span>jassa Mann</span>
                 <p>Rashid left 50 mins ago</p>
               </div>
             </div>
           </li> -->
         </ul>
         </div>
         <div class="card-footer"></div>
       </div>
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