import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Only works when running locally with Git access
    const { stdout, stderr } = await execPromise(
      'git add data/products.json public/uploads ; git commit -m "Katalog ve ayarlar guncellendi" ; git push origin main'
    );
    return NextResponse.json({
      success: true,
      message: 'Değişiklikler GitHub ve Vercel\'e başarıyla gönderildi! 30-45 saniye içinde sitede canlı olacaktır.',
      output: stdout || stderr,
    });
  } catch (error: any) {
    // If working tree is clean or already up to date
    if (error.stdout && error.stdout.includes('nothing to commit')) {
      return NextResponse.json({
        success: true,
        message: 'Tüm verileriniz zaten en güncel halinde.',
      });
    }
    return NextResponse.json({
      success: false,
      message: 'Vercel güncellemesi yerel bilgisayarda çalıştırılmalıdır veya Git bağlantısı kontrol edilmelidir.',
      error: error.message,
    }, { status: 500 });
  }
}
