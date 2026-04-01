document.addEventListener('DOMContentLoaded', () => {
    const claimBtn = document.getElementById('claim-btn');
    const meterFill = document.getElementById('meter-fill');
    const percentText = document.getElementById('percent-text');
    const queueText = document.getElementById('queue-text');
    const body = document.body;
    const trollScreen = document.getElementById('troll-screen');
    const mainContent = document.getElementById('main-content');
    
    // Audio
    const fahAudio = document.getElementById('audio-fah');
    
    let meterValue = 0;
    const maxMeter = 100;
    const clickPower = 2.5; // Slightly lower to make it require effort
    const drainRate = 0.6; // Adjusted for a smoother corporate feel
    
    let isGameRunning = false;
    let timerLoop, gameLoop;
    let won = false;
    
    const timeLeftDisplay = document.getElementById('time-left');
    let timeLeft = 180; // 3 minutes
    
    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;
        
        // Timer strictly ticks down
        timerLoop = setInterval(() => {
            if (won) return clearInterval(timerLoop);
            
            timeLeft--;
            if (timeLeft <= 0) {
                timeLeft = 0;
                triggerDefeat();
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeLeftDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Subtle UI warning at 10 seconds, no crazy colors
            if (timeLeft <= 10 && !won) {
                timeLeftDisplay.style.color = '#cc6a4b';
            }
        }, 1000);
        
        gameLoop = setInterval(() => {
            if (won) return clearInterval(gameLoop);
            
            if (meterValue > 0) {
                meterValue -= drainRate;
                if (meterValue < 0) meterValue = 0;
            }
            
            updateDisplay();
        }, 50); 
    }
    
    function playAudio(audioElem, volume = 1.0) {
        try {
            audioElem.volume = volume;
            if (!audioElem.paused) {
                audioElem.currentTime = 0;
            } else {
                audioElem.play().catch(e => console.log("Audio play prevented:", e));
            }
        } catch(e) {}
    }
    
    function triggerWin() {
        won = true;
        clearInterval(gameLoop);
        clearInterval(timerLoop);
        
        // The rug pull - instantaneous chaos right at the end
        body.className = 'deep-fried shake-3';
        playAudio(fahAudio, 1.0);
        
        setTimeout(() => {
            body.className = '';
            trollScreen.classList.remove('hidden');
            mainContent.classList.add('hidden');
            
            playAudio(fahAudio, 1.0);
        }, 1200);
    }
    
    function triggerDefeat() {
        won = true;
        clearInterval(gameLoop);
        clearInterval(timerLoop);
        
        document.querySelector('.glitch').innerText = "SESSION TIMEOUT";
        document.querySelector('#troll-screen p').innerText = "You missed the fake giveaway. Brutal.";
        
        trollScreen.classList.remove('hidden');
        mainContent.classList.add('hidden');
        playAudio(fahAudio, 1.0);
    }
    
    const maxQueue = 14204;
    function updateDisplay() {
        meterFill.style.width = `${meterValue}%`;
        percentText.innerText = `${meterValue.toFixed(1)}%`;
        
        // Connect queue perfectly to the inverse of their verification progress
        let currentQueue = Math.floor(maxQueue - (maxQueue * (meterValue / 100)));
        if(currentQueue < 1) currentQueue = 1;
        queueText.innerText = currentQueue.toLocaleString();
    }
    
    const handleTap = (e) => {
        e.preventDefault(); 
        if (won) return;
        
        startGame();
        
        meterValue += clickPower;
        if (meterValue >= maxMeter) {
            meterValue = maxMeter;
            updateDisplay();
            triggerWin();
            return;
        }
        
        updateDisplay();
    };
    
    claimBtn.addEventListener('mousedown', handleTap);
    claimBtn.addEventListener('touchstart', handleTap, { passive: false });
    
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
});
