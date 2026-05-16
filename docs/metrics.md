# Lapzy — Mapa de Métricas

> Este documento cataloga todas as métricas que o Lapzy pode oferecer no painel web, organizadas por nível de viabilidade hoje. Serve como referência para priorização de features do dashboard e como guia para decisões de produto.
>
> **Premissa de linguagem**: métricas técnicas devem aparecer na UI com nomes simples. Os nomes em *itálico* são os rótulos sugeridos para o usuário final.

---

## Grupo 1 — Métricas que já conseguimos criar

Deriváveis diretamente dos dados persistidos hoje (`RaceSessionRecord.laps[]`, `bestLapMs`, `date`, `sectors[]`). Nenhuma mudança no app ou no schema é necessária.

---

### *Seu recorde*
**Telemetria:** Personal Best (PB)
**Cálculo:** `MIN(bestLapMs)` de todas as sessões do usuário num mesmo kartódromo.
**Contexto:** Referência absoluta de performance — o número que o piloto quer bater.

---

### *Evolução*
**Telemetria:** Lap time trend / progression chart
**Cálculo:** Gráfico de linha com `bestLapMs` de cada sessão, ordenado por `date`, filtrado por kartódromo.
**Contexto:** Permite ver se o piloto está melhorando ao longo do tempo no mesmo circuito. Só faz sentido com ao menos 3 sessões no mesmo traçado.

---

### *Regularidade*
**Telemetria:** Lap consistency (standard deviation)
**Cálculo:** `STDDEV(laps[].lapMs)` por sessão. Quanto menor, mais consistente.
**Contexto:** Um piloto rápido mas irregular perde campeonatos. Regularidade é um diferencial do Lapzy — a maioria dos apps de kart não simplifica esse conceito para o público rental/amador.
**Exibição sugerida:** valor em ms + rótulo contextual ("Muito regular", "Regular", "Irregular").

---

### *Volta perfeita*
**Telemetria:** Theoretical best (combined sector PB)
**Cálculo:** Soma dos `MIN(sectors[i])` históricos de cada setor, por traçado. Só calculável quando o traçado tem `sectorBoundaries` configurado.
**Contexto:** Nenhum piloto já fez essa volta — é a soma dos melhores momentos em cada parte do circuito. Mostra o potencial máximo do piloto no traçado.

---

### *Total de voltas*
**Telemetria:** Session volume / total laps
**Cálculo:** `SUM(COUNT(laps[]))` por período ou por kartódromo.
**Contexto:** Proxy de experiência acumulada. Pilotos mais rápidos normalmente têm mais voltas.

---

### *Tempo total na pista*
**Telemetria:** Seat time
**Cálculo:** `SUM(laps[].lapMs)` convertido para horas e minutos.
**Contexto:** "Você passou 4h37min dentro do kart este mês." Dado simples que gera sensação de progresso e engajamento.

---

### *Kartódromo favorito*
**Telemetria:** Track frequency
**Cálculo:** Kartódromo com maior `COUNT(sessions)` por `trackId`.
**Contexto:** Dado leve, gera identidade — o piloto se reconhece no dado.

---

### *Resumo da última sessão*
**Telemetria:** Last session summary
**Cálculo:** Última `RaceSessionRecord` por `date DESC` — voltas, `bestLapMs`, `STDDEV`, kartódromo.
**Contexto:** Card de entrada do dashboard. O piloto vê o que aconteceu na última vez que entrou na pista.

---

### *Melhor sessão do período*
**Telemetria:** Session personal best
**Cálculo:** Sessão com menor `bestLapMs` num intervalo de datas configurável (semana, mês, ano).
**Contexto:** Permite que o piloto filtre o histórico e veja quando performou melhor.

---

### *Quanto você melhorou?*
**Telemetria:** Delta PB (first vs. last)
**Cálculo:** Diferença entre o `bestLapMs` da primeira e da última sessão no mesmo kartódromo.
**Exibição sugerida:** "Você andou 2.3s mais rápido do que na sua primeira sessão aqui."

---

## Grupo 2 — Métricas com pequenos ajustes

Requerem mudanças pontuais no app (novos campos no modelo, nova coleta de dado) ou lógica adicional no hub (recalcular algo que o app fazia ao vivo). Nenhuma mudança de arquitetura.

---

### *Precisão do GPS*
**Telemetria:** GPS device profiling
**Dependência:** TASK-023 — coleta de `GpsDevice` (fabricante, modelo, versão Android) ao final da corrida.
**Cálculo:** Sem cálculo — exibe o dispositivo usado e uma nota contextual sobre a precisão típica daquele perfil de hardware.
**Contexto:** Pilotos iniciantes questionam a precisão dos dados. Mostrar que o Samsung A35 tem GPS de ±5-10m e que isso representa ~±300ms de erro de cronometragem ajuda o piloto a interpretar o dado corretamente — e cria confiança no produto.
**Exibição sugerida:** Badge no resumo de sessão: "Cronometrado com Samsung Galaxy A35 · Precisão típica: ±300ms"

---

### *Voltas filtradas (sem ruído)*
**Telemetria:** Outlier-filtered lap analysis
**Dependência:** Reimplementar no hub a detecção de outlier que o app já faz ao vivo (`±20% ou ±5s da mediana das últimas 5 voltas`) — hoje esse flag é calculado mas não persistido.
**Cálculo:** Hub recalcula a mediana móvel e marca voltas suspeitas no histórico.
**Contexto:** Evita que uma volta com GPS falho (kart parado, GPS perdido) distorça a regularidade ou a média da sessão. Dado invisível para o usuário — apenas filtra o cálculo de regularidade e média automaticamente.

---

### *Seu setor mais fraco*
**Telemetria:** Worst sector vs. theoretical best
**Dependência:** Dados de setor já existem — basta cruzar `MIN(sectors[i])` vs. `AVG(sectors[i])` por setor.
**Cálculo:** Setor onde `(AVG - MIN) / MIN` é maior — proporcionalidade, não valor absoluto.
**Contexto:** "Você perde mais tempo no S2 do que em qualquer outro setor." Dado acionável — o piloto sabe onde focar.

---

### *Comparação com a referência*
**Telemetria:** Reference lap delta
**Dependência:** TASK-024 — traçados compartilhados. Com traçados importados de outros pilotos (ex: professor), o hub pode comparar `bestLapMs` e setores entre o aluno e a referência no mesmo traçado.
**Cálculo:** `referenciaBestLapMs - alunosBestLapMs` por setor e por volta completa.
**Contexto:** Professor configura o traçado, compartilha com alunos. No hub, o aluno vê: "Você está 3.2s mais lento que a referência — S1 está OK, o gap está todo no S3."
**Nota:** Só compara dados que o próprio usuário possui localmente. Não há acesso ao histórico de outro usuário — só ao traçado geométrico.

---

### *Velocidade de pico estimada*
**Telemetria:** Peak GPS speed
**Dependência:** O `geolocator` já retorna `speed` (m/s) em cada posição GPS. Bastaria armazenar o `maxSpeedMs` (m/s) por volta ou por sessão — mudança pequena em `LapResult` ou `RaceSessionRecord`.
**Cálculo:** `MAX(speed)` nas amostras GPS da sessão, convertido para km/h.
**Contexto:** Dado popular entre pilotos — "atingi 89 km/h na reta" — mesmo com GPS esparso (0.2Hz) é uma estimativa razoável em retas longas.
**Limitação a comunicar:** Velocidade GPS pode subestimar picos em retas curtas (kart passa entre dois updates). Exibir com contexto de imprecisão.

---

## Grupo 3 — Métricas que ainda podemos construir

Requerem evolução significativa — novas fontes de dado (sensores não usados hoje), arquitetura de backend mais complexa, ou hardware externo. Válidas como roadmap de médio/longo prazo.

---

### *Mapa de velocidade da pista*
**Telemetria:** GPS speed heatmap overlay
**Dependência:** TASK-022 — coletar amostras de `(lat, lng, speed)` por volta, armazenar junto ao `LapResult`. O hub renderiza a polilinha colorida por velocidade.
**Status:** Planejado (TASK-022 no backlog do app). Requer mudança de modelo (novos dados por volta) e nova UI no hub (mapa interativo).
**Limitação GPS:** Com 0.2Hz, a resolução é de ~70m entre amostras a 50km/h. Aceitável para retas, impreciso para curvas rápidas.

---

### *G-force e curvas*
**Telemetria:** Lateral and longitudinal G-force
**Dependência:** Acelerômetro (`sensors_plus`) — não coletado hoje.
**O que precisaria:** Coletar `(ax, ay, az)` em alta frequência (≥50Hz) durante a corrida; sincronizar com timestamps de volta; armazenar por amostra.
**Contexto:** Permite ver se o piloto está freando bem, acelerando cedo, e usando o grip do kart. Diferencial enorme para pilotos de nível intermediário+.
**Custo:** Alto — volume de dados por sessão cresce ~100x. Precisaria de storage local mais robusto (substituir SharedPreferences por SQLite/Hive) e compressão.

---

### *Comparação entre pilotos (ranking)*
**Telemetria:** Multi-user leaderboard
**Dependência:** TASK-024 cria a base (traçados compartilhados), mas para ranking real seria necessário que sessões fossem marcadas como "no mesmo traçado compartilhado" e que os usuários optassem por compartilhar seus tempos.
**O que precisaria:** Modelo de `SharedSession` ou opt-in de publicidade de `bestLapMs` por traçado compartilhado; backend com aggregação multi-usuário.
**Contexto:** Essencial para o caso de uso professor/aluno em escala — o professor veria o ranking de todos os alunos num mesmo traçado.

---

### *Trajetória vs. linha ideal*
**Telemetria:** Racing line analysis
**Dependência:** GPS a frequência muito maior (10–50Hz) — hoje o Samsung A35 entrega ~0.2Hz.
**O que precisaria:** Hardware GPS externo dedicado (ex: Garmin GPSMAP, GPS de corrida) via Bluetooth, ou mudança para chipset com GNSS melhor.
**Contexto:** Mostra se o piloto está cortando a curva cedo ou tarde. Padrão em telemetria profissional (AiM, MoTeC). Inviável com GPS de celular a 0.2Hz.

---

### *Condições de pista*
**Telemetria:** Environmental conditions
**Dependência:** API climática externa (OpenWeatherMap, WeatherAPI) ou sensor onboard.
**O que precisaria:** No hub, enriquecer `RaceSessionRecord` com dados de temperatura e umidade por geolocalização+data da sessão (retroativamente ou em tempo real).
**Contexto:** Ajuda o piloto a entender por que a volta de ontem estava 1.5s mais lenta — estava 35°C, pista molhada.

---

### *Telemetria de motor*
**Telemetria:** Engine data (RPM, throttle, brake)
**Dependência:** Hardware externo — datalogger OBD2/CAN conectado ao kart + integração Bluetooth.
**O que precisaria:** Protocolo de comunicação com o ECU do kart, hardware específico por marca de motor (Rotax, TaG, IAME), integração no app via Bluetooth.
**Contexto:** Nível de telemetria usado em F4 e kartismo competitivo de alto nível. Fora do escopo do Lapzy atual (voltado para rental e pilotos amadores), mas viável como produto premium futuro.

---

## Resumo de dependências por grupo

| Grupo | Dependência principal | Impacto de implementação |
|---|---|---|
| Grupo 1 | Nenhuma — dados já existem | Apenas lógica no hub |
| Grupo 2 | TASK-023 (device info), TASK-024 (traçados compartilhados), 1 campo novo (`maxSpeedMs`) | Mudanças pequenas no app + hub |
| Grupo 3 | Novos sensores, hardware externo, arquitetura multi-usuário | Alta — planejamento de médio/longo prazo |
