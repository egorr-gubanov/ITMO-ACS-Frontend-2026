<script setup>
import { computed } from 'vue'
import { api } from '../api/index.js'
import { TYPES } from '../constants.js'
import { useAuth } from '../composables/useAuth.js'
import { useRequest } from '../composables/useRequest.js'
import { usePlan } from '../composables/usePlan.js'
import StatusMessage from '../components/StatusMessage.vue'
import ProgressBar from '../components/ProgressBar.vue'
import PlanItem from '../components/PlanItem.vue'

const { user, refreshUser } = useAuth()
const { data, loading, error, execute } = useRequest(async signal => {
  const [, trainings] = await Promise.all([refreshUser(signal), api.getTrainings({}, signal)])
  return trainings
})
const { plan, completed, percent, saving, error: planError, message, toggle, remove } = usePlan()
const trainingsById = computed(() => Object.fromEntries((data.value || []).map(item => [item.id, item])))

execute()
</script>

<template>
  <StatusMessage :message="error || (loading ? 'Загружаем личный кабинет…' : '')" :error="Boolean(error)" />
  <button v-if="error" class="btn btn-brutal btn-paper" type="button" @click="execute()">Повторить</button>
  <div v-if="data && user">
    <p class="eyebrow">Личный кабинет</p>
    <h1 class="display-title">Привет, {{ user.name }}!</h1>
    <p class="lead-copy">{{ user.email }} · Направление: {{ TYPES[user.goal] }}</p>
    <ProgressBar :completed="completed" :total="plan.length" :percent="percent" />
    <StatusMessage :message="planError || (saving ? 'Сохраняем план…' : message)" :error="Boolean(planError)" />
    <StatusMessage v-if="!plan.length" message="В плане пока нет занятий. Выбери тренировку в каталоге и укажи день недели." />
    <section class="plan-list" aria-label="Занятия в плане" :aria-busy="saving">
      <template v-for="item in plan" :key="item.day">
        <PlanItem
            v-if="trainingsById[item.trainingId]"
            :item="item"
            :training="trainingsById[item.trainingId]"
            :disabled="saving"
            @toggle="toggle(item.day, item.trainingId, $event)"
            @remove="remove(item.day, item.trainingId)"
        />
      </template>
    </section>
    <RouterLink class="btn btn-brutal btn-clay mt-4" to="/">Выбрать занятие</RouterLink>
  </div>
</template>