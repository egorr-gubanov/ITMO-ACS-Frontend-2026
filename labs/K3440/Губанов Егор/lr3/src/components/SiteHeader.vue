<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { isAuthenticated, logout } = useAuth()

function exit() {
  logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="site-header">
    <div class="container-xl py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
      <RouterLink class="brand" to="/">ВМЕСТЕ</RouterLink>
      <nav class="site-nav" aria-label="Основная навигация">
        <RouterLink to="/" exact-active-class="active">Занятия</RouterLink>
        <RouterLink to="/profile" active-class="active">Мой план</RouterLink>
        <RouterLink to="/blog" active-class="active">Блог</RouterLink>
        <button v-if="isAuthenticated" class="nav-button" type="button" @click="exit">Выйти</button>
        <template v-else>
          <RouterLink to="/login" active-class="active">Войти</RouterLink>
          <RouterLink to="/register" active-class="active">Регистрация</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>