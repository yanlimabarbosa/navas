# 📊 Formato do Arquivo Excel - Gerador de Encartes

Este documento explica o formato correto do arquivo Excel para importação de produtos no sistema de geração de encartes.

## 📋 Estrutura Obrigatória

O arquivo Excel deve conter **exatamente** as seguintes colunas na primeira linha (cabeçalho):

| Coluna | Nome | Tipo | Descrição | Exemplo |
|--------|------|------|-----------|---------|
| A | `Posicao` | Número | Posição do produto no encarte (1-12) | 1, 2, 3... |
| B | `Codigo` | Texto | Código do produto | 1408177, ABC123 |
| C | `Preco` | Número | Preço do produto | 10,50 ou 10.50 |
| D | `Descricao` | Texto | Descrição/nome do produto | PARAFUSO PHILLIPS M4 |
| E | `Diferencial` | Texto | Especificações técnicas | 5MX19MM, 3/8", etc. |
| F | `Imagem` | Texto | Nome do arquivo de imagem (sem extensão) | 1408177, produto1 |

## 🎯 Posicionamento no Encarte

O encarte possui um grid de **4 colunas x 3 linhas = 12 posições**:

```
┌─────┬─────┬─────┬─────┐
│  1  │  2  │  3  │  4  │
├─────┼─────┼─────┼─────┤
│  5  │  6  │  7  │  8  │
├─────┼─────┼─────┼─────┤
│  9  │ 10  │ 11  │ 12  │
└─────┴─────┴─────┴─────┘
```

**Importante**: Use números de 1 a 12 na coluna `Posicao`.

## 📦 Tipos de Agrupamento

O sistema automaticamente detecta o tipo de agrupamento baseado nos produtos na mesma posição:

### 1. **Produto Único** (`single`)
- **1 produto** por posição
- Exibe o produto individualmente com preço em destaque

### 2. **Mesmo Preço** (`same-price`)
- **Múltiplos produtos** na mesma posição
- **Todos com o mesmo preço**
- Exibe a imagem comum e lista as especificações

### 3. **Preços Diferentes** (`different-price`)
- **Múltiplos produtos** na mesma posição
- **Preços diferentes**
- Exibe uma linha por produto com código, especificação e preço

## 💰 Formato de Preços

O sistema aceita preços em ambos os formatos:
- **Vírgula**: `10,50` ✅
- **Ponto**: `10.50` ✅

**Exemplos válidos**:
- `5,99`
- `12.75`
- `100,00`
- `1250.50`

## 🖼️ Imagens dos Produtos

### Localização das Imagens
As imagens devem estar na pasta: `public/imagens_produtos/`

### Formatos Suportados
O sistema suporta os seguintes formatos de imagem:
- **JPG/JPEG** (`.jpg`, `.jpeg`)
- **PNG** (`.png`)
- **WebP** (`.webp`)

### Nomenclatura
- **Nome no Excel**: Apenas o nome do arquivo (sem extensão)
- **Arquivo físico**: `{nome}.jpg`, `{nome}.jpeg`, `{nome}.png` ou `{nome}.webp`

**Exemplo**:
- **No Excel**: `1408177`
- **Arquivos válidos**:
  - `public/imagens_produtos/1408177.jpg`
  - `public/imagens_produtos/1408177.jpeg`
  - `public/imagens_produtos/1408177.png`
  - `public/imagens_produtos/1408177.webp`

## 📝 Exemplo Prático

### Estrutura do Excel:

| Posicao | Codigo | Preco | Descricao | Diferencial | Imagem |
|---------|--------|-------|-----------|-------------|---------|
| 1 | 1408177 | 6,69 | PARAFUSO PHILLIPS | 3MX16MM | 1408177 |
| 2 | 1401849 | 9,75 | PARAFUSO FENDA | 5MX19MM | 1401849 |
| 3 | 1406500 | 1008,99 | FURADEIRA ELÉTRICA | 7,5X25MM | 1406500 |
| 4 | PAR001 | 15,50 | PORCA SEXTAVADA | M6 | porca_m6 |
| 4 | PAR002 | 15,50 | PORCA SEXTAVADA | M8 | porca_m6 |
| 4 | PAR003 | 15,50 | PORCA SEXTAVADA | M10 | porca_m6 |

### Resultado:
- **Posição 1**: Produto único - Parafuso Phillips
- **Posição 2**: Produto único - Parafuso Fenda  
- **Posição 3**: Produto único - Furadeira Elétrica
- **Posição 4**: Grupo mesmo preço - 3 porcas com mesmo preço

## ⚠️ Problemas Comuns

### ❌ Erros Frequentes:

1. **Posição inválida**: Usar números fora do range 1-12
2. **Colunas faltando**: Não incluir todas as 6 colunas obrigatórias
3. **Preços inválidos**: Usar texto em vez de número
4. **Imagem não encontrada**: Nome no Excel não corresponde ao arquivo de imagem
5. **Codificação**: Caracteres especiais corrompidos

### ✅ Dicas para Evitar Erros:

1. Use o modelo de Excel fornecido como base
2. Verifique se todas as imagens existem antes de importar
3. Confira se os preços estão em formato numérico
4. Mantenha os nomes dos arquivos simples, sem caracteres especiais
5. Salve o Excel em formato .xlsx
