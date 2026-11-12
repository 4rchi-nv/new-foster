import type { Metadata } from "next";

import { PageHero, Section } from "@/components/ui/primitives";
import { company } from "@/lib/company";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

const text = {
  ru: {
    lede: "Как ООО «Нью Фостер» обращается с персональными данными на этом сайте.",
    paragraphs: [
      "Оператор: ООО «Нью Фостер». Юридический адрес, ИНН и ОГРН указаны на странице контактов. По вопросам обработки персональных данных: info@newfoster.com.",
      "На сайте нет форм. Посетитель не вводит имя, телефон, почту и другие данные. Чтобы связаться с компанией, человек сам пишет на info@newfoster.com или звонит по телефону, указанному на странице контактов. Такое обращение используется, чтобы ответить на него.",
      "Сервер может записывать IP-адрес и технические сведения о запросе в журналы, которые нужны для работы и защиты сайта. Срок хранения журналов задаёт хостинг.",
      "Счётчик аналитики, если он подключён, включается только после согласия в окне на сайте. До согласия идентификаторы посетителя никуда не отправляются.",
      "Запрос об уточнении или удалении данных, которые вы сами направили по почте или по телефону, можно отправить на info@newfoster.com.",
    ],
  },
  en: {
    lede: "How New Foster LLC handles personal data on this site.",
    paragraphs: [
      "Operator: New Foster LLC. The legal address, INN, and OGRN are on the contacts page. Questions about personal data: info@newfoster.com.",
      "The site has no forms. A visitor does not enter a name, phone number, email, or other data. To reach the company, the person writes to info@newfoster.com or calls the phone number on the contacts page. That message is used to reply.",
      "The server may record the IP address and technical details of a request in logs required to run and protect the site. The host sets how long those logs are kept.",
      "An analytics counter, if one is connected, starts only after consent in the banner on the site. Until then, visitor identifiers are not sent.",
      "A request to clarify or delete data you sent by email or phone can be sent to info@newfoster.com.",
    ],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  return pageMetadata({
    locale,
    path: "/privacy",
    title: t.privacy,
    description: text[locale].lede,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params);
  const t = copy(locale);
  const page = text[locale];
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.privacy }]}
        title={t.privacy}
        lede={page.lede}
      />
      <Section>
        <div className="max-w-3xl space-y-5 leading-7">
          {page.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="text-muted">
            {company.address}. {locale === "ru" ? "ИНН" : "INN"} {company.inn}. {locale === "ru" ? "ОГРН" : "OGRN"} {company.ogrn}.
          </p>
        </div>
      </Section>
    </>
  );
}
