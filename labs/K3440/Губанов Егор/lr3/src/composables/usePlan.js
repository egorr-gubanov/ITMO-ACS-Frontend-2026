import { computed, ref } from 'vue'
import { api } from '../api/index.js'
import { DAYS } from '../constants.js'
import { useAuth } from './useAuth.js'

export function usePlan() {
    const { user, refreshUser } = useAuth()
    const saving = ref(false)
    const error = ref('')
    const message = ref('')
    const plan = computed(() => [...(user.value?.plan || [])].sort((a, b) =>
        Object.keys(DAYS).indexOf(a.day) - Object.keys(DAYS).indexOf(b.day)
    ))
    const completed = computed(() => plan.value.filter(item => item.completed).length)
    const percent = computed(() => plan.value.length
        ? Math.round(completed.value / plan.value.length * 100)
        : 0)

    async function save(update, success = 'План сохранён.') {
        if (saving.value) return false
        saving.value = true
        error.value = ''
        message.value = ''
        try {
            const actual = await refreshUser()
            user.value = await api.updatePlan(actual.id, update(actual.plan || []))
            message.value = success
            return true
        } catch (cause) {
            error.value = cause.message
            return false
        } finally {
            saving.value = false
        }
    }

    function add(day, trainingId) {
        return save(items => {
            const previous = items.find(item => item.day === day && item.trainingId === trainingId)
            return [...items.filter(item => item.day !== day), previous || {
                day,
                trainingId,
                completed: false
            }]
        }, `План сохранён: ${DAYS[day]}.`)
    }

    function toggle(day, value) {
        return save(items => items.map(item => item.day === day
            ? { ...item, completed: value }
            : item))
    }

    function remove(day) {
        return save(items => items.filter(item => item.day !== day))
    }

    function finish(day, trainingId) {
        return save(items => {
            if (!items.some(item => item.day === day && item.trainingId === trainingId)) {
                throw new Error('Это занятие уже убрали из плана. Открой личный кабинет.')
            }
            return items.map(item => item.day === day ? { ...item, completed: true } : item)
        }, 'Занятие отмечено в твоём плане.')
    }

    function resetStatus() {
        error.value = ''
        message.value = ''
    }

    return { plan, completed, percent, saving, error, message, add, toggle, remove, finish, resetStatus }
}