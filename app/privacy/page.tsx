export const metadata = {
  title: 'プライバシーポリシー | ParentSeed',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500 mb-6">最終更新日: 2026年3月23日</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. はじめに</h2>
          <p>
            ParentSeed（以下「本アプリ」）は、育児中の保護者の感情記録と心のケアを支援するサービスです。
            本プライバシーポリシーでは、本アプリにおける個人情報の取り扱いについて説明します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. 収集する情報</h2>
          <p>本アプリでは、以下の情報を収集します：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>メールアドレス（アカウント登録・認証用）</li>
            <li>感情記録データ（感情の種類、日記の内容、記録日時）</li>
            <li>AIカウンセラーとのチャット内容（セッション中のみ、サーバーには保存されません）</li>
            <li>プッシュ通知トークン（通知送信用、任意）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>アカウントの認証とサービスの提供</li>
            <li>感情の記録・分析機能の提供</li>
            <li>AIによるアドバイスの生成</li>
            <li>プッシュ通知の送信（ユーザーが許可した場合のみ）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. 第三者への提供</h2>
          <p>
            本アプリでは、AIアドバイス機能の提供のため、Anthropic社のClaude APIを利用しています。
            感情記録の内容がAIアドバイス生成のためにAnthropicのAPIに送信されますが、
            Anthropicはこのデータをモデルの学習に使用しません。
          </p>
          <p className="mt-2">
            上記を除き、ユーザーの個人情報を第三者に販売、共有、または開示することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. データの保存</h2>
          <p>
            ユーザーデータはSupabase（クラウドデータベース）に安全に保存されます。
            データは暗号化され、適切なアクセス制御が施されています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. データの削除</h2>
          <p>
            ユーザーはいつでもアカウントを削除することができます。
            アカウント削除時には、関連するすべてのデータ（感情記録、プッシュ通知トークン等）が
            完全に削除されます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. セキュリティ</h2>
          <p>
            本アプリは、ユーザーの情報を保護するために、SSL/TLS暗号化、
            Row Level Security（RLS）によるデータアクセス制御など、
            適切なセキュリティ対策を講じています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. お子様のプライバシー</h2>
          <p>
            本アプリは育児中の保護者を対象としたサービスであり、
            13歳未満のお子様から意図的に個人情報を収集することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. ポリシーの変更</h2>
          <p>
            本プライバシーポリシーは、必要に応じて変更されることがあります。
            重要な変更がある場合は、アプリ内で通知します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. お問い合わせ</h2>
          <p>
            本プライバシーポリシーに関するご質問がある場合は、アプリ内のお問い合わせ機能よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
