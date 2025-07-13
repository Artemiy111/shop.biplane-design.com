<script setup lang="ts">
import { useApi } from '~/shared/api'

const message = ref('')
const toast = useToast()

const { mutate } = useMutation({
  mutation: () => useApi().customer.addToQueue.mutate({ message: message.value }),
  onError: (err) => {
    toast.add({ color: 'error', title: 'Не удалось добавить в очередь', description: err.message })
  },
  onSuccess: () => {
    toast.add({ color: 'success', title: 'Добавлено в очередь' })
  },
})
</script>

<template>
  <main>
    orders
    <UInput
      v-model="message"
      placeholder="message"
    />
    <UButton @click="() => mutate()">
      add to queue
    </UButton>
  </main>
</template>
