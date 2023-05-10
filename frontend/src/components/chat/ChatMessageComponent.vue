<template>
    <div class="chat">
      <div class="header">
        <div class="avatar"></div>
        <div class="info">
          <div class="name">{{ name }}</div>
          <div class="status">{{ status }}</div>
        </div>
      </div>
      <div class="messages">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <div class="avatar"></div>
          <div class="content">
            <div class="name">{{ message.name }}</div>
            <div class="text">{{ message.text }}</div>
          </div>
        </div>
      </div>
      <div class="input">
        <input v-model="messageText" placeholder="Say something..." />
        <button @click="sendMessage" style="background-color: transparent; color:#525252; font-size:x-large;">➤</button>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
  import { defineProps, ref } from 'vue';
  
  interface Message {
    name: string;
    text: string;
  }
</script>

<style scoped>
  .chat {
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    width: 400px;
    height: 366px;
    border-radius:4px 0px 0px 0px;
  }
  
  .header {
    background-color: #ececec;
    color: #fff;
    display: flex;
    align-items: center;
    padding: 5px;
    border-bottom: #d4d4d4;
    border-bottom-style:ridge;
    border-bottom-width: 1px;
    background-color: #ececec;
    border-radius: 10px 0px 0px 0px;
  }
  
  .avatar {
    background-color: #ddd;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .info {
    display: flex;
    flex-direction: column;
  }
  
  .name {
    font-size: 18px;
    font-weight: bold;
  }
  
  .status {
    font-size: 14px;
  }
  
  .messages {
    overflow-y: scroll;
    flex-grow: 1;
    padding: 10px;
  }
  
  .message {
    display: flex;
    margin-bottom: 10px;
  }
  
  .content {
    background-color: #fff;
    border-radius: 5px;
    padding: 10px;
    max-width: 70%;
  }
  
  .name {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .text {
    font-size: 16px;
  }
  
  .input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
    border-top: #d4d4d4;
    border-top-style:ridge;
    border-top-width: 1px;
    background-color: #ececec;
  }
  
  input {
    flex-grow: 1;
    margin-right: 10px;
    padding: 10px;
    border-radius: 5px;
    border: none;
    font-size: 16px;
  }
  
  button {
    background-color: #444653;
    border: none;
    border-radius: 5px;
    color: #fff;
    font-size: 16px;
    padding: 10px;
    cursor: pointer;
  }
  </style>