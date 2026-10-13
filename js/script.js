document.addEventListener('DOMContentLoaded', () => {
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');

});                               
    
    const startModal = document.gerElementById('start-modal');
    const startForm = document.gerElementById('start-form');
    const playerInput = document.gerElementById('player-Input');
    const btnViewRanking = document.gerElementById('btn-view-rankig');

    const gameoverModal = document.gerElementById('gameover-modal');
    const finalScoreValue = document.gerElementById('final-score-value');
    const saveStatusMsg = document.gerElementById('ranking-body');
    const btnRestart = document.gerElementById('btn-restart');
    const btnChangePlayer = document.gerElementById('btn-change-player');
    //variaveis de estado
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;
    //recuperação do ultimo nome de usuario utilizado
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput){
        playerInput.value = savedName;
    }
    function startGame(){
        //limpa loops anteriores
        clearInterval(gameLoop)
        clearInterval(scoreLoop)
        //reseta as posições visuais
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';

        //Ativa as animações CSS do Jogo.
        gameBoard.classList.add('running');

         scoreLoop = setInterval(() => {
        if(isPlaying){
            score += 1;
            scoreDisplay.textContent = score;
        }
    }, 100)
    //loop de colisao
    gameLoop = setInterval(checkCollision, 10);

    }
    //resetar os estilos e posições do Mario e do cano(obstáculo)
    function resetElements(){
        //reseta o obstaculo
        pipe.style.animation = '';
        pipe.style.left = '';

        //reset do mario
        mario.scr = '../assets/mario.gif'//sai da pasta e entra na pasta assets
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove = ('jump');
        if(jumpTip){
        jumpTip.style.opacity = '1';
        }
    }
    //executa o pulo do mario
    function jump(){
        if(!isPlaying) return;
        if(mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if(jumpTip) {;
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500)
    }
    //verificar a colisão entre o mario e o cano(obstaculo)
    function checkCollision(){
        if('!isPlaying') return;

        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        //tolerancia de colisao: quando o cano está na faixa de contato com o Mario
        if(pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
            triggerGameOver(pipePosition, marioPosition);
        }
    }
    //tratar o GameOver
    function triggerGameOver(pipePosition, marioPosition){
        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);
        //remover a classe running para as animações
        gameBoard.classList.remove('running');
        //congela o cano na posição exata da colisão
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
        //congela o mario na altura exata e muda para a imagem de Game Over
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = '../assets/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';
        //atualização do modal de game over
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');
        //salva a pontuação no banco com a função criada chamada saveScore
        saveScore(currentPlayer, score);
    }

    function saveScore(playerName, finalScore){
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'appication/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
        .then(res => res.json)
        .then(data => {
            if (data.status === 'sucesso'){
                saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if(data.ranking){
                    renderRanking(data.ranking, playerName, finalscore);
                }
            } else {
                saveStatusMsg.textContent = (data.message || 'Erro ao registrar!');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição', err);
            saveStatusMsg.textContent = 'Erro ao conectar ao servidor.'
            saveStatusMsg.style.color = '#ef4444'
        });
    }
    //busca o ranking atualizado do banco
    function fetchRanking(){
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then(data =>{
            if(data.status === 'success' && data.ranking){
                renderRanking(data.ranking);
            }
        })
        .catch(err => console.error('Erro ao buscar o ranking', err));
    }
    //vamos atualizar a tabela do ranking no HTML
    function renderRanking(list, highlightName = null, highlightScore = null ){
        if(!rankingBody) return;
        rankingBody.innerHTML = '';
        if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda</td></tr>`;
            return;
        }
        let highlightted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if(!highlightted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore){
                tr.classList.add('highlight-current');
                highlightted = true
            }

            let medal = `${index + 1}º`;
            if(index === 0) medal = '🥇 1º'
            if(index === 1) medal = '🥈 2º'
            if(index === 2) medal = '🥉 3º'

            tr.innerHTML = `
            <td class="ranking-pos">${medal}</td>
            <td><strong>${escapeHtml(item.nome)}</strong></td>
            <td>${pareInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        })
    }
    function escapeHtml(){
        if(!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }

    //eventos de controle e interface do jogo
    //iniciar o jogo(formulario)
    startForm.addEventListener('submit', (e) => {
        e.preventDefault(); //Impede o recarregamento da página

        const nameValue = playerInput.value.trim();
        if(!nameValue) {
            // ja vem clicado
            playerInput.focus();
            return;
        }
        currentPlayer = nameValue;
        localStorage.setItem('mario_jump_player', currentPlayer);
        // fecha a tela e começa o jogo depois de preencher os dados
        startModal.classList.remove('active');
        startGame();
    });
    
    //botão ver ranking