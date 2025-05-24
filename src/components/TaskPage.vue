<template>
  <div>
    <h1>Task Manager for Project {{ projectId }}</h1>
    <task-manager :projectId="projectId" />
  </div>
</template>

<script>
import TaskManager from './TaskDetailPage.vue'

export default {
  components: {
    TaskManager,
  },
  computed: {
    projectId() {
      return parseInt(this.$route.params.id)
    },
  },
}
</script>
