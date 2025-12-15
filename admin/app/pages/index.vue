<template>
  <div class="login-wrapper">
    <div class="login-card">

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="email" id="email" v-model="email" placeholder="Email" required
            :class="{ 'error-border': errorMessage }" />
        </div>

        <div class="form-group">
          <input type="password" id="password" v-model="password" placeholder="Password" required
            :class="{ 'error-border': errorMessage }" />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="login-btn">
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script lang='ts' setup>
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid Credentials");
    }

    localStorage.setItem('token', data.access_token);


    alert('Login Successful!');
    console.table(`Email: ${email.value} Password: ${password.value}`);


  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Center the form on the page */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f6f8;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin: 0;
  color: #333;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  /* Ensures padding doesn't break width */
}

input:focus {
  outline: none;
  border-color: #42b883;
  /* Vue Green */
}

input.error-border {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  background-color: #fff1f0;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #3aa876;
}

.login-btn:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}
</style>
