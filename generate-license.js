/**
 * Gerador de Licenças Criptografadas v2.0 - Soryan Assessoria
 * 
 * SISTEMA DE SEGURANÇA MÁXIMA
 * - Criptografia AES-256
 * - Assinatura HMAC anti-adulteração
 * - Verificação de integridade
 * 
 * Uso: node generate-license.js
 * Verificar: node generate-license.js --verify license.dat
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ===== CHAVES DE SEGURANÇA - NÃO ALTERAR! =====
const RAW_KEY = 'SoryanAssessoria2026SecretKey!!';
const LICENSE_SECRET_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const HMAC_SECRET = 'SoryanHMAC_Signature_Key_2026_Secure';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
// ================================================

// Criptografia com assinatura HMAC
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(LICENSE_SECRET_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Adiciona assinatura HMAC
    const payload = iv.toString('hex') + ':' + encrypted;
    const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

    return payload + ':' + hmac;
}

function decrypt(encryptedText) {
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) return null;

        const [ivHex, encrypted, signature] = parts;

        // Verifica assinatura HMAC
        const payload = ivHex + ':' + encrypted;
        const expectedHmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

        if (signature !== expectedHmac) {
            console.error('❌ ADULTERAÇÃO DETECTADA! Assinatura inválida.');
            return null;
        }

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(LICENSE_SECRET_KEY), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return null;
    }
}

// Gera assinatura interna da licença (anti-edit)
function generateLicenseSignature(activationDate, planDays, clientName) {
    const signatureData = `${activationDate}:${planDays}:${clientName || ''}`;
    return crypto.createHmac('sha256', HMAC_SECRET).update(signatureData).digest('hex').substring(0, 16);
}

const PLAN_DAYS = {
    'mensal': 30,
    'trimestral': 90,
    'semestral': 180,
    'anual': 365
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  GERADOR DE LICENÇAS v2.0 - SORYAN ASSESSORIA  ║');
    console.log('║    Sistema de Segurança Anti-Bypass Total      ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const clientName = await question('👤 Nome do cliente: ');

    console.log('\n📋 Planos disponíveis:');
    console.log('  1. Mensal    (30 dias)');
    console.log('  2. Trimestral (90 dias)');
    console.log('  3. Semestral  (180 dias)');
    console.log('  4. Anual      (365 dias)');

    const planChoice = await question('\nEscolha o plano (1-4): ');
    const planTypes = ['mensal', 'trimestral', 'semestral', 'anual'];
    const planType = planTypes[parseInt(planChoice) - 1] || 'mensal';
    const planDays = PLAN_DAYS[planType];

    const today = new Date().toISOString().split('T')[0];
    const activationDateInput = await question(`📅 Data de ativação (${today}): `) || today;

    // Gera assinatura interna
    const signature = generateLicenseSignature(activationDateInput, planDays, clientName);

    const licenseData = {
        activationDate: activationDateInput,
        planType: planType,
        planDays: planDays,
        clientName: clientName,
        signature: signature,
        createdAt: new Date().toISOString()
    };

    console.log('\n─────────────────────────────────────────');
    console.log('📄 Dados da Licença:');
    console.log('─────────────────────────────────────────');
    console.log(`   Cliente: ${clientName}`);
    console.log(`   Plano: ${planType} (${planDays} dias)`);
    console.log(`   Ativação: ${activationDateInput}`);
    console.log(`   Signature: ${signature}`);

    const encrypted = encrypt(JSON.stringify(licenseData));

    const outputPath = path.join(process.cwd(), 'license.dat');
    fs.writeFileSync(outputPath, encrypted, 'utf8');

    // Calcula data de expiração
    const activationDate = new Date(licenseData.activationDate);
    const expirationDate = new Date(activationDate);
    expirationDate.setDate(expirationDate.getDate() + planDays);

    console.log('─────────────────────────────────────────\n');
    console.log('✅ LICENÇA GERADA COM SUCESSO!\n');
    console.log(`📁 Arquivo: ${outputPath}`);
    console.log(`� Expira em: ${expirationDate.toISOString().split('T')[0]}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Copie o license.dat para a pasta do executável');
    console.log('   2. O cliente PRECISA de internet na primeira execução');
    console.log('   3. Arquivo é criptografado e assinado - impossível adulterar\n');

    rl.close();
}

// Modo de verificação
if (process.argv[2] === '--verify') {
    const filePath = process.argv[3] || 'license.dat';

    if (!fs.existsSync(filePath)) {
        console.error('❌ Arquivo não encontrado:', filePath);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const decrypted = decrypt(content);

    if (decrypted) {
        const data = JSON.parse(decrypted);

        // Verifica assinatura interna
        const expectedSig = generateLicenseSignature(data.activationDate, data.planDays, data.clientName);
        const sigValid = data.signature === expectedSig;

        console.log('\n✅ Licença válida!\n');
        console.log('📄 Detalhes:');
        console.log(`   Cliente: ${data.clientName}`);
        console.log(`   Plano: ${data.planType} (${data.planDays} dias)`);
        console.log(`   Ativação: ${data.activationDate}`);
        console.log(`   Assinatura: ${sigValid ? '✅ Válida' : '❌ INVÁLIDA'}`);
        console.log(`   Criado em: ${data.createdAt}`);
    } else {
        console.log('\n❌ Licença inválida ou corrompida');
    }

    process.exit(0);
}

main().catch(console.error);
