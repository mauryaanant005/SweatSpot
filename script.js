 let timerInterval;
        let startTime;
        let elapsedTime = 0;
        let isRunning = false;

        const display = document.getElementById('display');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        function formatTime(time) {
            const date = new Date(time);
            const hours = String(Math.floor(time / 3600000)).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        function updateDisplay() {
            const now = Date.now();
            const time = now - startTime + elapsedTime;
            display.textContent = formatTime(time);
        }

        function startTimer() {
            if (!isRunning) {
                startTime = Date.now();
                timerInterval = setInterval(updateDisplay, 100); // 100ms update is enough for seconds
                isRunning = true;
                startBtn.classList.add('hidden');
                stopBtn.classList.remove('hidden');
            }
        }

        function stopTimer() {
            if (isRunning) {
                clearInterval(timerInterval);
                elapsedTime += Date.now() - startTime;
                isRunning = false;
                startBtn.classList.remove('hidden');
                stopBtn.classList.add('hidden');
            }
        }

        function resetTimer() {
            stopTimer();
            elapsedTime = 0;
            display.textContent = "00:00:00";
        }

        let currentSteps = 0;
        const stepGoal = 10000;
        const stepCountEl = document.getElementById('stepCount');
        const stepProgressEl = document.getElementById('stepProgress');
        const stepGoalEl = document.getElementById('stepGoalDisplay');

        // Initialize display
        if (stepGoalEl) stepGoalEl.innerText = stepGoal;

        function updateStepUI() {
            if(!stepCountEl) return;
            stepCountEl.innerText = currentSteps.toLocaleString();
            let percentage = (currentSteps / stepGoal) * 100;
            if (percentage > 100) percentage = 100;
            
            stepProgressEl.style.width = `${percentage}%`;
            
            // Change color if goal reached
            if (percentage >= 100) {
                stepProgressEl.classList.remove('from-neon-green', 'to-emerald-600');
                stepProgressEl.classList.add('from-yellow-400', 'to-orange-500');
            } else {
                stepProgressEl.classList.add('from-neon-green', 'to-emerald-600');
                stepProgressEl.classList.remove('from-yellow-400', 'to-orange-500');
            }
        }

        function addSteps(amount) {
            currentSteps += amount;
            updateStepUI();
        }

        function resetSteps() {
            currentSteps = 0;
            updateStepUI();
        }
        /* ----------------------------------------------------------------
           2. BMI CALCULATOR
           ---------------------------------------------------------------- */
        function calculateBMI() {
            const height = parseFloat(document.getElementById('heightInput').value);
            const weight = parseFloat(document.getElementById('weightInput').value);
            const resultBox = document.getElementById('bmiResult');
            const valEl = document.getElementById('bmiValue');
            const catEl = document.getElementById('bmiCategory');
            const suggEl = document.getElementById('bmiSuggestion');

            // Sync weight to calorie calculator for convenience
            if(weight) document.getElementById('calWeightInput').value = weight;

            if (!height || !weight || height <= 0 || weight <= 0) {
                alert("Please enter valid height and weight!");
                return;
            }

            // BMI Formula: weight (kg) / (height (m))^2
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            const bmiRounded = bmi.toFixed(1);

            resultBox.classList.remove('hidden');
            valEl.innerText = bmiRounded;

            let category = '';
            let colorClass = '';
            let suggestion = '';

            if (bmi < 18.5) {
                category = 'Underweight';
                colorClass = 'text-blue-400';
                suggestion = 'Focus on nutrient-rich foods and strength training.';
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                category = 'Normal Weight';
                colorClass = 'text-green-400';
                suggestion = 'Great job! Maintain your balanced diet and activity.';
            } else if (bmi >= 25 && bmi <= 29.9) {
                category = 'Overweight';
                colorClass = 'text-yellow-400';
                suggestion = 'Try increasing cardio and watching portion sizes.';
            } else {
                category = 'Obese';
                colorClass = 'text-red-400';
                suggestion = 'Consult a healthcare provider for a personalized plan.';
            }

            catEl.innerText = category;
            catEl.className = `text-sm font-medium ${colorClass}`;
            suggEl.innerText = suggestion;
        }

        /* ----------------------------------------------------------------
           3. TO-DO PLANNER (With LocalStorage)
           ---------------------------------------------------------------- */
        const taskInput = document.getElementById('taskInput');
        const taskList = document.getElementById('taskList');
        let tasks = [];

        // Load tasks on startup
        document.addEventListener('DOMContentLoaded', () => {
            try {
                const storedTasks = localStorage.getItem('fitSpotTasks');
                if (storedTasks) {
                    tasks = JSON.parse(storedTasks);
                    renderTasks();
                }
            } catch (e) {
                console.warn("LocalStorage not available in this environment.");
            }
        });

        function handleEnter(e) {
            if (e.key === 'Enter') addTask();
        }

        function saveTasks() {
            try {
                localStorage.setItem('fitSpotTasks', JSON.stringify(tasks));
            } catch (e) {
                // Ignore storage errors in restricted environments
            }
        }

        function addTask() {
            const text = taskInput.value.trim();
            if (text === "") return;

            const newTask = {
                id: Date.now(),
                text: text,
                completed: false
            };

            tasks.push(newTask);
            taskInput.value = "";
            saveTasks();
            renderTasks();
        }

        function toggleTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) return { ...task, completed: !task.completed };
                return task;
            });
            saveTasks();
            renderTasks();
        }

        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }

        function renderTasks() {
            taskList.innerHTML = "";
            
            if (tasks.length === 0) {
                taskList.innerHTML = `
                    <div class="text-center text-gray-500 mt-10">
                        <i class="fa-solid fa-dumbbell text-4xl mb-2 opacity-30"></i>
                        <p class="text-sm">No tasks yet.</p>
                    </div>`;
                return;
            }

            tasks.forEach(task => {
                const li = document.createElement('div');
                li.className = `task-item flex items-center justify-between bg-white/5 p-3 rounded-lg mb-2 ${task.completed ? 'task-completed opacity-60' : ''}`;
                
                li.innerHTML = `
                    <div class="flex items-center space-x-3 cursor-pointer overflow-hidden" onclick="toggleTask(${task.id})">
                        <div class="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : ''}">
                            ${task.completed ? '<i class="fa-solid fa-check text-xs text-white"></i>' : ''}
                        </div>
                        <span class="text-sm truncate select-none">${task.text}</span>
                    </div>
                    <button onclick="deleteTask(${task.id})" class="text-red-400 hover:text-red-300 transition-colors ml-2">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                taskList.appendChild(li);
            });
        }

        /* ----------------------------------------------------------------
           4. CALORIE ESTIMATOR
           ---------------------------------------------------------------- */
        function calculateCalories() {
            const met = parseFloat(document.getElementById('activitySelect').value);
            const duration = parseFloat(document.getElementById('durationInput').value);
            const weight = parseFloat(document.getElementById('calWeightInput').value);
            const resultEl = document.getElementById('calResult');

            if (!duration || !weight) {
                alert("Please enter duration and weight.");
                return;
            }

            // Formula: Calories = (MET * 3.5 * weight) / 200 * duration
            // This is a standard approximation formula
            const calories = (met * 3.5 * weight) / 200 * duration;
            
            // Animation for the number
            animateValue(resultEl, 0, Math.round(calories), 1000);
        }

        function animateValue(obj, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                obj.innerHTML = Math.floor(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }