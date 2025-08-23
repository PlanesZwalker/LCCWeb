# 🎮 Guide Unity 6.2 - Letters Cascade Challenge

## 📋 Vue d'ensemble du projet

**Letters Cascade Challenge** est un jeu de formation de mots en français où les joueurs connectent des lettres qui tombent pour former des mots valides. Le jeu propose plusieurs versions : 2D classique, 2D améliorée et 3D immersive.

### 🎯 Caractéristiques principales
- **Formation de mots** : Connecter des lettres adjacentes pour former des mots français
- **Dictionnaire complet** : 4,700+ mots français courants
- **Modes multiples** : 2D classique, 2D améliorée, et 3D
- **Difficulté progressive** : Niveaux de plus en plus difficiles
- **Système de score** : Points dynamiques avec bonus

## 🛠️ Configuration Unity 6.2

### Prérequis
- Unity 6.2 (dernière version)
- Visual Studio 2022 ou JetBrains Rider
- Connaissances de base en C#
- Assets Unity (gratuits ou payants) pour les effets visuels

### Installation
1. Téléchargez Unity Hub depuis [unity.com](https://unity.com)
2. Installez Unity 6.2 via Unity Hub
3. Créez un nouveau projet 3D (URP) pour de meilleures performances

## 🏗️ Architecture du projet

### Structure des dossiers
```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── GameManager.cs
│   │   ├── Letter.cs
│   │   ├── Grid.cs
│   │   └── WordDetector.cs
│   ├── UI/
│   │   ├── UIManager.cs
│   │   ├── ScoreDisplay.cs
│   │   └── MenuController.cs
│   ├── Systems/
│   │   ├── AudioManager.cs
│   │   ├── ParticleManager.cs
│   │   └── LevelManager.cs
│   └── Utils/
│       ├── Dictionary.cs
│       └── GameUtils.cs
├── Prefabs/
│   ├── Letter.prefab
│   ├── GridCell.prefab
│   └── UI/
├── Materials/
├── Textures/
├── Audio/
└── Scenes/
    ├── MainMenu.unity
    ├── Game2D.unity
    └── Game3D.unity
```

## 📝 Implémentation des scripts principaux

### 1. GameManager.cs - Gestionnaire principal
```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Collections;

public class GameManager : MonoBehaviour
{
    [Header("Game Settings")]
    public int gridWidth = 10;
    public int gridHeight = 14;
    public float fallSpeed = 2f;
    public int targetWordsCount = 8;
    
    [Header("References")]
    public GameObject letterPrefab;
    public Transform gridParent;
    public UIManager uiManager;
    
    // Game State
    private bool gameRunning = false;
    private int score = 0;
    private int level = 1;
    private List<string> targetWords = new List<string>();
    private Dictionary<string, bool> dictionary;
    
    // Grid System
    private Letter[,] grid;
    private List<Letter> fallingLetters = new List<Letter>();
    
    void Start()
    {
        InitializeGame();
    }
    
    void InitializeGame()
    {
        // Charger le dictionnaire
        LoadDictionary();
        
        // Créer la grille
        CreateGrid();
        
        // Générer les mots cibles
        GenerateTargetWords();
        
        // Démarrer le jeu
        StartGame();
    }
    
    void LoadDictionary()
    {
        // Charger les 4,700+ mots français
        TextAsset dictFile = Resources.Load<TextAsset>("dictionary");
        string[] words = dictFile.text.Split('\n');
        
        dictionary = new Dictionary<string, bool>();
        foreach (string word in words)
        {
            if (!string.IsNullOrEmpty(word))
                dictionary[word.Trim().ToUpper()] = true;
        }
    }
    
    void CreateGrid()
    {
        grid = new Letter[gridHeight, gridWidth];
        
        for (int row = 0; row < gridHeight; row++)
        {
            for (int col = 0; col < gridWidth; col++)
            {
                Vector3 position = new Vector3(col * 1.2f, -row * 1.2f, 0);
                GameObject cell = Instantiate(letterPrefab, position, Quaternion.identity, gridParent);
                grid[row, col] = cell.GetComponent<Letter>();
                grid[row, col].Initialize(row, col);
            }
        }
    }
    
    void GenerateTargetWords()
    {
        targetWords.Clear();
        string[] commonWords = {
            "CHAT", "MAISON", "MUSIQUE", "JARDIN", "LIVRE", 
            "TABLE", "FENETRE", "PORTE", "JEU", "LIVRE"
        };
        
        for (int i = 0; i < targetWordsCount; i++)
        {
            targetWords.Add(commonWords[Random.Range(0, commonWords.Length)]);
        }
    }
    
    void StartGame()
    {
        gameRunning = true;
        StartCoroutine(LetterFallRoutine());
        uiManager.UpdateScore(score);
        uiManager.UpdateLevel(level);
    }
    
    IEnumerator LetterFallRoutine()
    {
        while (gameRunning)
        {
            SpawnNewLetter();
            yield return new WaitForSeconds(fallSpeed);
        }
    }
    
    void SpawnNewLetter()
    {
        char randomLetter = GetRandomLetter();
        Vector3 spawnPosition = new Vector3(Random.Range(0, gridWidth) * 1.2f, 10f, 0);
        
        GameObject letterObj = Instantiate(letterPrefab, spawnPosition, Quaternion.identity);
        Letter letter = letterObj.GetComponent<Letter>();
        letter.SetLetter(randomLetter);
        letter.StartFalling();
        
        fallingLetters.Add(letter);
    }
    
    char GetRandomLetter()
    {
        // Distribution pondérée basée sur les mots cibles
        string allLetters = string.Join("", targetWords);
        return allLetters[Random.Range(0, allLetters.Length)];
    }
}
```

### 2. Letter.cs - Gestion des lettres
```csharp
using UnityEngine;
using System.Collections;

public class Letter : MonoBehaviour
{
    [Header("Letter Properties")]
    public char letter;
    public bool isPlaced = false;
    public bool isFalling = false;
    
    [Header("Visual")]
    public TextMesh letterText;
    public SpriteRenderer background;
    
    // Grid position
    public int gridRow = -1;
    public int gridCol = -1;
    
    // Movement
    private float fallSpeed = 2f;
    private Vector3 targetPosition;
    
    void Start()
    {
        if (letterText == null)
            letterText = GetComponentInChildren<TextMesh>();
    }
    
    public void Initialize(int row, int col)
    {
        gridRow = row;
        gridCol = col;
        isPlaced = true;
    }
    
    public void SetLetter(char newLetter)
    {
        letter = newLetter;
        if (letterText != null)
            letterText.text = letter.ToString();
    }
    
    public void StartFalling()
    {
        isFalling = true;
        StartCoroutine(FallRoutine());
    }
    
    IEnumerator FallRoutine()
    {
        while (isFalling)
        {
            transform.Translate(Vector3.down * fallSpeed * Time.deltaTime);
            
            // Vérifier si la lettre touche la grille
            if (transform.position.y <= 0)
            {
                PlaceOnGrid();
                break;
            }
            
            yield return null;
        }
    }
    
    void PlaceOnGrid()
    {
        isFalling = false;
        isPlaced = true;
        
        // Trouver la position de grille la plus proche
        Vector3 gridPos = FindNearestGridPosition();
        transform.position = gridPos;
        
        // Mettre à jour la grille
        GameManager.Instance.UpdateGrid(this);
        
        // Vérifier la formation de mots
        GameManager.Instance.CheckWordFormation();
    }
    
    Vector3 FindNearestGridPosition()
    {
        // Logique pour trouver la position de grille la plus proche
        return transform.position;
    }
    
    void OnMouseDown()
    {
        if (isPlaced)
        {
            GameManager.Instance.SelectLetter(this);
        }
    }
}
```

### 3. WordDetector.cs - Détection des mots
```csharp
using UnityEngine;
using System.Collections.Generic;

public class WordDetector : MonoBehaviour
{
    private Dictionary<string, bool> dictionary;
    
    public void Initialize(Dictionary<string, bool> dict)
    {
        dictionary = dict;
    }
    
    public List<string> ScanGrid(Letter[,] grid)
    {
        List<string> foundWords = new List<string>();
        
        // Scanner horizontalement
        ScanHorizontal(grid, foundWords);
        
        // Scanner verticalement
        ScanVertical(grid, foundWords);
        
        // Scanner en diagonale
        ScanDiagonal(grid, foundWords);
        
        return foundWords;
    }
    
    void ScanHorizontal(Letter[,] grid, List<string> foundWords)
    {
        int rows = grid.GetLength(0);
        int cols = grid.GetLength(1);
        
        for (int row = 0; row < rows; row++)
        {
            string currentWord = "";
            
            for (int col = 0; col < cols; col++)
            {
                if (grid[row, col] != null && grid[row, col].isPlaced)
                {
                    currentWord += grid[row, col].letter;
                }
                else
                {
                    CheckWord(currentWord, foundWords);
                    currentWord = "";
                }
            }
            
            CheckWord(currentWord, foundWords);
        }
    }
    
    void ScanVertical(Letter[,] grid, List<string> foundWords)
    {
        int rows = grid.GetLength(0);
        int cols = grid.GetLength(1);
        
        for (int col = 0; col < cols; col++)
        {
            string currentWord = "";
            
            for (int row = 0; row < rows; row++)
            {
                if (grid[row, col] != null && grid[row, col].isPlaced)
                {
                    currentWord += grid[row, col].letter;
                }
                else
                {
                    CheckWord(currentWord, foundWords);
                    currentWord = "";
                }
            }
            
            CheckWord(currentWord, foundWords);
        }
    }
    
    void ScanDiagonal(Letter[,] grid, List<string> foundWords)
    {
        // Implémentation de la détection diagonale
        // (code similaire aux scans horizontal/vertical)
    }
    
    void CheckWord(string word, List<string> foundWords)
    {
        if (word.Length >= 3 && dictionary.ContainsKey(word))
        {
            if (!foundWords.Contains(word))
            {
                foundWords.Add(word);
                Debug.Log($"Mot trouvé : {word}");
            }
        }
    }
}
```

### 4. UIManager.cs - Interface utilisateur
```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UIManager : MonoBehaviour
{
    [Header("UI Elements")]
    public TextMeshProUGUI scoreText;
    public TextMeshProUGUI levelText;
    public TextMeshProUGUI targetWordsText;
    public Button pauseButton;
    public GameObject gameOverPanel;
    
    [Header("Target Words Display")]
    public Transform targetWordsParent;
    public GameObject targetWordPrefab;
    
    void Start()
    {
        SetupUI();
    }
    
    void SetupUI()
    {
        if (pauseButton != null)
            pauseButton.onClick.AddListener(OnPauseClick);
    }
    
    public void UpdateScore(int newScore)
    {
        if (scoreText != null)
            scoreText.text = $"Score: {newScore}";
    }
    
    public void UpdateLevel(int newLevel)
    {
        if (levelText != null)
            levelText.text = $"Niveau: {newLevel}";
    }
    
    public void UpdateTargetWords(List<string> words)
    {
        // Nettoyer l'affichage existant
        foreach (Transform child in targetWordsParent)
        {
            Destroy(child.gameObject);
        }
        
        // Créer les nouveaux éléments
        foreach (string word in words)
        {
            GameObject wordObj = Instantiate(targetWordPrefab, targetWordsParent);
            TextMeshProUGUI wordText = wordObj.GetComponentInChildren<TextMeshProUGUI>();
            if (wordText != null)
                wordText.text = word;
        }
    }
    
    public void ShowGameOver(int finalScore, int wordsCompleted)
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);
            
            // Mettre à jour les statistiques finales
            TextMeshProUGUI finalScoreText = gameOverPanel.GetComponentInChildren<TextMeshProUGUI>();
            if (finalScoreText != null)
                finalScoreText.text = $"Score Final: {finalScore}\nMots Complétés: {wordsCompleted}";
        }
    }
    
    void OnPauseClick()
    {
        GameManager.Instance.TogglePause();
    }
}
```

## 🎨 Système de rendu 3D

### Configuration URP (Universal Render Pipeline)
1. **Package Manager** → Installer "Universal RP"
2. **Project Settings** → Graphics → Assigner le URP Asset
3. **Quality Settings** → Configurer les niveaux de qualité

### Shaders personnalisés
```csharp
// Shader pour les lettres avec effet de lueur
Shader "Custom/LetterGlow"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _GlowColor ("Glow Color", Color) = (1,1,1,1)
        _GlowIntensity ("Glow Intensity", Range(0, 2)) = 1
    }
    
    SubShader
    {
        Tags { "RenderType"="Opaque" "Queue"="Geometry" }
        
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            
            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };
            
            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };
            
            sampler2D _MainTex;
            float4 _GlowColor;
            float _GlowIntensity;
            
            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }
            
            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 col = tex2D(_MainTex, i.uv);
                col += _GlowColor * _GlowIntensity;
                return col;
            }
            ENDCG
        }
    }
}
```

## 🔊 Système audio

### AudioManager.cs
```csharp
using UnityEngine;
using System.Collections.Generic;

public class AudioManager : MonoBehaviour
{
    [Header("Audio Sources")]
    public AudioSource musicSource;
    public AudioSource sfxSource;
    
    [Header("Audio Clips")]
    public AudioClip backgroundMusic;
    public AudioClip letterPlaceSound;
    public AudioClip wordCompleteSound;
    public AudioClip levelUpSound;
    public AudioClip gameOverSound;
    
    [Header("Volume Settings")]
    [Range(0, 1)] public float musicVolume = 0.7f;
    [Range(0, 1)] public float sfxVolume = 0.8f;
    
    void Start()
    {
        SetupAudio();
    }
    
    void SetupAudio()
    {
        if (musicSource != null && backgroundMusic != null)
        {
            musicSource.clip = backgroundMusic;
            musicSource.volume = musicVolume;
            musicSource.loop = true;
            musicSource.Play();
        }
    }
    
    public void PlayLetterPlace()
    {
        PlaySFX(letterPlaceSound);
    }
    
    public void PlayWordComplete()
    {
        PlaySFX(wordCompleteSound);
    }
    
    public void PlayLevelUp()
    {
        PlaySFX(levelUpSound);
    }
    
    public void PlayGameOver()
    {
        PlaySFX(gameOverSound);
    }
    
    void PlaySFX(AudioClip clip)
    {
        if (sfxSource != null && clip != null)
        {
            sfxSource.PlayOneShot(clip, sfxVolume);
        }
    }
    
    public void SetMusicVolume(float volume)
    {
        musicVolume = volume;
        if (musicSource != null)
            musicSource.volume = volume;
    }
    
    public void SetSFXVolume(float volume)
    {
        sfxVolume = volume;
    }
}
```

## 🎯 Système de particules

### ParticleManager.cs
```csharp
using UnityEngine;

public class ParticleManager : MonoBehaviour
{
    [Header("Particle Systems")]
    public ParticleSystem letterPlaceEffect;
    public ParticleSystem wordCompleteEffect;
    public ParticleSystem levelUpEffect;
    public ParticleSystem comboEffect;
    
    public void PlayLetterPlaceEffect(Vector3 position)
    {
        if (letterPlaceEffect != null)
        {
            letterPlaceEffect.transform.position = position;
            letterPlaceEffect.Play();
        }
    }
    
    public void PlayWordCompleteEffect(Vector3 position)
    {
        if (wordCompleteEffect != null)
        {
            wordCompleteEffect.transform.position = position;
            wordCompleteEffect.Play();
        }
    }
    
    public void PlayLevelUpEffect()
    {
        if (levelUpEffect != null)
        {
            levelUpEffect.Play();
        }
    }
    
    public void PlayComboEffect(int comboCount)
    {
        if (comboEffect != null)
        {
            var emission = comboEffect.emission;
            emission.rateOverTime = comboCount * 10;
            comboEffect.Play();
        }
    }
}
```

## 📊 Système de sauvegarde

### SaveSystem.cs
```csharp
using UnityEngine;
using System.IO;
using System;

[Serializable]
public class GameData
{
    public int highScore;
    public int totalWordsCompleted;
    public int totalPlayTime;
    public int maxLevelReached;
    public DateTime lastPlayDate;
}

public class SaveSystem : MonoBehaviour
{
    private string savePath;
    private GameData gameData;
    
    void Start()
    {
        savePath = Path.Combine(Application.persistentDataPath, "gameData.json");
        LoadGameData();
    }
    
    public void SaveGameData()
    {
        if (gameData == null)
            gameData = new GameData();
        
        string json = JsonUtility.ToJson(gameData, true);
        File.WriteAllText(savePath, json);
    }
    
    public void LoadGameData()
    {
        if (File.Exists(savePath))
        {
            string json = File.ReadAllText(savePath);
            gameData = JsonUtility.FromJson<GameData>(json);
        }
        else
        {
            gameData = new GameData();
        }
    }
    
    public void UpdateHighScore(int score)
    {
        if (score > gameData.highScore)
        {
            gameData.highScore = score;
            SaveGameData();
        }
    }
    
    public int GetHighScore()
    {
        return gameData.highScore;
    }
}
```

## 🎮 Configuration des contrôles

### InputManager.cs
```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class InputManager : MonoBehaviour
{
    private PlayerInput playerInput;
    private Camera mainCamera;
    
    void Start()
    {
        mainCamera = Camera.main;
        playerInput = GetComponent<PlayerInput>();
    }
    
    public void OnClick(InputValue value)
    {
        if (value.isPressed)
        {
            Vector2 mousePosition = Mouse.current.position.ReadValue();
            HandleClick(mousePosition);
        }
    }
    
    void HandleClick(Vector2 screenPosition)
    {
        Ray ray = mainCamera.ScreenPointToRay(screenPosition);
        RaycastHit hit;
        
        if (Physics.Raycast(ray, out hit))
        {
            Letter letter = hit.collider.GetComponent<Letter>();
            if (letter != null)
            {
                GameManager.Instance.SelectLetter(letter);
            }
        }
    }
    
    public void OnPause(InputValue value)
    {
        if (value.isPressed)
        {
            GameManager.Instance.TogglePause();
        }
    }
}
```

## 🚀 Optimisation et performance

### Conseils d'optimisation
1. **Object Pooling** pour les lettres
2. **LOD (Level of Detail)** pour les modèles 3D
3. **Culling** pour les objets hors écran
4. **Compression des textures**
5. **Optimisation des shaders**

### ObjectPool.cs
```csharp
using UnityEngine;
using System.Collections.Generic;

public class ObjectPool : MonoBehaviour
{
    [System.Serializable]
    public class Pool
    {
        public string tag;
        public GameObject prefab;
        public int size;
    }
    
    public List<Pool> pools;
    private Dictionary<string, Queue<GameObject>> poolDictionary;
    
    void Start()
    {
        poolDictionary = new Dictionary<string, Queue<GameObject>>();
        
        foreach (Pool pool in pools)
        {
            Queue<GameObject> objectPool = new Queue<GameObject>();
            
            for (int i = 0; i < pool.size; i++)
            {
                GameObject obj = Instantiate(pool.prefab);
                obj.SetActive(false);
                objectPool.Enqueue(obj);
            }
            
            poolDictionary.Add(pool.tag, objectPool);
        }
    }
    
    public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
    {
        if (!poolDictionary.ContainsKey(tag))
        {
            Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
            return null;
        }
        
        GameObject objectToSpawn = poolDictionary[tag].Dequeue();
        
        if (objectToSpawn.activeInHierarchy)
        {
            poolDictionary[tag].Enqueue(objectToSpawn);
            return null;
        }
        
        objectToSpawn.SetActive(true);
        objectToSpawn.transform.position = position;
        objectToSpawn.transform.rotation = rotation;
        
        poolDictionary[tag].Enqueue(objectToSpawn);
        
        return objectToSpawn;
    }
}
```

## 📱 Support mobile

### Configuration mobile
1. **Player Settings** → Target Platform → Android/iOS
2. **Quality Settings** → Réduire la qualité pour mobile
3. **Input System** → Configurer les contrôles tactiles
4. **UI Scaling** → Adapter l'interface pour différentes tailles d'écran

### TouchInput.cs
```csharp
using UnityEngine;
using UnityEngine.EventSystems;

public class TouchInput : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IDragHandler
{
    private bool isDragging = false;
    private Vector2 startPosition;
    
    public void OnPointerDown(PointerEventData eventData)
    {
        isDragging = true;
        startPosition = eventData.position;
        HandleTouch(eventData.position);
    }
    
    public void OnPointerUp(PointerEventData eventData)
    {
        isDragging = false;
    }
    
    public void OnDrag(PointerEventData eventData)
    {
        if (isDragging)
        {
            HandleTouch(eventData.position);
        }
    }
    
    void HandleTouch(Vector2 position)
    {
        // Logique de gestion du toucher
        Ray ray = Camera.main.ScreenPointToRay(position);
        RaycastHit hit;
        
        if (Physics.Raycast(ray, out hit))
        {
            Letter letter = hit.collider.GetComponent<Letter>();
            if (letter != null)
            {
                GameManager.Instance.SelectLetter(letter);
            }
        }
    }
}
```

## 🧪 Tests et débogage

### Tests unitaires
```csharp
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class GameTests
{
    [Test]
    public void WordDetection_ValidWord_ReturnsTrue()
    {
        // Arrange
        WordDetector detector = new WordDetector();
        Dictionary<string, bool> dict = new Dictionary<string, bool>
        {
            {"CHAT", true},
            {"MAISON", true}
        };
        detector.Initialize(dict);
        
        // Act
        bool isValid = detector.IsValidWord("CHAT");
        
        // Assert
        Assert.IsTrue(isValid);
    }
    
    [Test]
    public void ScoreCalculation_WordLength_ReturnsCorrectScore()
    {
        // Arrange
        ScoreManager scoreManager = new ScoreManager();
        
        // Act
        int score = scoreManager.CalculateWordScore("CHAT");
        
        // Assert
        Assert.AreEqual(40, score); // 4 lettres * 10 points
    }
}
```

## 📦 Build et déploiement

### Configuration de build
1. **File** → Build Settings
2. **Scenes in Build** → Ajouter toutes les scènes
3. **Platform** → Sélectionner la plateforme cible
4. **Player Settings** → Configurer les paramètres spécifiques
5. **Build** → Générer l'exécutable

### Script de build automatisé
```csharp
using UnityEditor;
using UnityEngine;

public class BuildScript
{
    [MenuItem("Build/Build All Platforms")]
    public static void BuildAllPlatforms()
    {
        // Build pour Windows
        BuildPipeline.BuildPlayer(
            EditorBuildSettings.scenes,
            "Builds/Windows/LettersCascade.exe",
            BuildTarget.StandaloneWindows64,
            BuildOptions.None
        );
        
        // Build pour Android
        BuildPipeline.BuildPlayer(
            EditorBuildSettings.scenes,
            "Builds/Android/LettersCascade.apk",
            BuildTarget.Android,
            BuildOptions.None
        );
    }
}
```

## 🎯 Prochaines étapes

### Fonctionnalités avancées à implémenter
1. **Mode multijoueur** avec Photon ou Mirror
2. **Système d'achievements** avec Steam/PlayStation/Xbox
3. **Mode campagne** avec progression narrative
4. **Éditeur de niveaux** intégré
5. **Analytics** pour suivre les performances
6. **Localisation** pour d'autres langues

### Optimisations futures
1. **Machine Learning** pour l'IA des mots
2. **Procedural Generation** des niveaux
3. **Cloud Save** avec PlayFab ou Firebase
4. **Social Features** (classements, partage)
5. **Accessibility** (contrôles adaptés, sous-titres)

---

## 📚 Ressources supplémentaires

### Documentation Unity
- [Unity Manual](https://docs.unity3d.com/Manual/)
- [Unity Scripting API](https://docs.unity3d.com/ScriptReference/)
- [Unity Learn](https://learn.unity.com/)

### Assets recommandés
- **TextMeshPro** : Rendu de texte avancé
- **Cinemachine** : Système de caméra
- **Input System** : Nouveau système d'entrée
- **Universal RP** : Pipeline de rendu moderne

### Communautés
- [Unity Forums](https://forum.unity.com/)
- [Unity Discord](https://discord.gg/unity)
- [Reddit r/Unity3D](https://www.reddit.com/r/Unity3D/)

---

**🎮 Bon développement avec Unity 6.2 !**
