/*
 * Allergoproba / Vivacell — автономный интерактивный ПРОТОТИП.
 * Все данные (включая нарисованную подпись) остаются в оперативной памяти страницы.
 * Ни запросов к РПН, ни настоящего подписания/сохранения документа здесь нет.
 * Юридические пункты ниже приведены точно в редакции, предоставленной заказчиком.
 */
'use strict';

const DEMO_RPN = Object.freeze({
  representative: Object.freeze({iin:'123456789012', name:'Косилов Данил Алексеевич', dob:'22.12.2005'}),
  child: Object.freeze({iin:'160504500777', name:'Косилов Арсен Данилович', dob:'04.05.2016'}),
});
const STUDIES = ['rsal', 'ifa', 'rhino', 'general', 'hormones'];
const FLOW_MODE = document.body.dataset.flow === 'allergens' ? 'allergens' : 'studies';
const ALLERGENS = FLOW_MODE === 'allergens' && Array.isArray(window.ALLERGENS_CATALOG) ? window.ALLERGENS_CATALOG : [];
const DEMO_ALLERGEN_PRICE_KZT = 5000; // Тестовая цена за один аллерген, НЕ официальный тариф лаборатории.
const ALLERGEN_UI = {
  ru: {
    welcome:'Запись на исследование аллергенов', subtitle:'Выберите конкретные аллергены из каталога и оформите заявку самостоятельно',
    openOther:'Перейти к выбору исследований', other:'Отдельный флоу: выбор аллергенов',
    title:'Выберите аллергены', help:'Найдите нужный препарат в списке. Можно выбрать несколько аллергенов.',
    search:'Поиск по названию аллергена или препарата', all:'Все',
    categories:{anesthetics:'Анестетики',antibiotics:'Антибиотики',antiinflammatory:'Противовоспалительные',hormonal:'Гормональные препараты'},
    selected:'Выбрано аллергенов', none:'Пока ничего не выбрано', results:'Найдено',empty:'По вашему запросу ничего не найдено',
    remove:'Убрать из выбора', chosen:'Выбранные аллергены', label:'Аллергены',
    notice:'Демонстрационный каталог. Реальный перечень доступных аллергенов необходимо подключить из справочника ИС.',
    error:'Выберите хотя бы один аллерген.', priceLabel:'Демо-цена', totalLabel:'Предварительная сумма', priceNote:'Тестовые цены. Итоговую стоимость подтвердит лаборатория.', perItem:'за аллерген', paymentNote:'Это расчёт в интерфейсе. Статический QR не содержит привязки к сумме.'
  },
  kz: {
    welcome:'Аллергендерге зерттеуге жазылу', subtitle:'Тізімнен аллергендерді таңдап, өтінімді өзіңіз рәсімдеңіз',
    openOther:'Зерттеулерді таңдауға өту',other:'Бөлек ағын: аллергенді таңдау',
    title:'Аллергендерді таңдаңыз',help:'Тізімнен қажетті препаратты табыңыз. Бірнеше аллергенді таңдауға болады.',
    search:'Аллерген немесе препарат атауы бойынша іздеу',all:'Барлығы',
    categories:{anesthetics:'Анестетиктер',antibiotics:'Антибиотиктер',antiinflammatory:'Қабынуға қарсы дәрілер',hormonal:'Гормоналды препараттар'},
    selected:'Таңдалған аллергендер',none:'Әзірше ештеңе таңдалмады',results:'Табылды',empty:'Сұрауыңыз бойынша ештеңе табылмады',
    remove:'Таңдаудан алып тастау',chosen:'Таңдалған аллергендер',label:'Аллергендер',
    notice:'Демонстрациялық каталог. Нақты аллергендер тізімі ақпараттық жүйенің анықтамалығынан алынуы тиіс.',
    error:'Кемінде бір аллергенді таңдаңыз.', priceLabel:'Демо баға', totalLabel:'Алдын ала сома', priceNote:'Тест бағалар. Нақты құнын зертхана растайды.', perItem:'әр аллергенге', paymentNote:'Бұл тек интерфейстегі есеп. Статикалық QR сомаға байланыстырылмаған.'
  },
  en: {
    welcome:'Allergen testing registration', subtitle:'Select specific allergens from the catalog and complete the application',
    openOther:'Switch to examination selection',other:'Separate flow: choose allergens',
    title:'Select allergens',help:'Find the medicine you need. Multiple allergens can be selected.',
    search:'Search for an allergen or medicine',all:'All',
    categories:{anesthetics:'Anesthetics',antibiotics:'Antibiotics',antiinflammatory:'Anti-inflammatory',hormonal:'Hormonal preparations'},
    selected:'Allergens selected',none:'No allergens selected yet',results:'Found',empty:'No matching items',
    remove:'Remove selection',chosen:'Selected allergens',label:'Allergens',
    notice:'Demo-only catalog. The approved list must be connected to the laboratory information system.',
    error:'Select at least one allergen.', priceLabel:'Demo price', totalLabel:'Estimated total', priceNote:'Demo pricing only. The laboratory will confirm the actual cost.', perItem:'per allergen', paymentNote:'Illustrative calculation only. The static QR is not linked to the amount.'
  }
};
const allergenUI = () => ALLERGEN_UI[state.lang] || ALLERGEN_UI.ru;

const PAYMENT_TEXT = {
 ru:{
  title:'Как хотите оплатить?',subtitle:'Заявка оформлена. Выберите удобный способ оплаты.',
  now:'Оплатить сейчас',nowDescription:'Перейти к оплате через Kaspi QR',
  later:'Оплатить позже',laterDescription:'Завершить оформление без оплаты сейчас',
  continue:'Продолжить',choose:'Выберите вариант оплаты.',
  methodTitle:'Выберите способ оплаты',methodSubtitle:'Для оплаты сейчас доступен Kaspi QR',
  kaspi:'Kaspi QR',kaspiDescription:'Оплата через приложение Kaspi.kz',
  scanTitle:'Сканируйте QR-код в Kaspi',scanDescription:'Откройте Kaspi.kz на другом устройстве и отсканируйте QR-код для оплаты.',
  qrCaution:'Это QR-код, предоставленный для демонстрации. Перед реальной оплатой проверьте получателя и сумму в приложении Kaspi.',
  qrVerify:'Прототип не получает сведения об оплате. Даже после завершения оформления платёж останется в статусе «Ожидает подтверждения».',
  finish:'Завершить оформление',payLaterInstead:'Оплачу позже',
  statusLabel:'Статус оплаты',laterStatus:'Не оплачено · оплата позже',pendingStatus:'Ожидает подтверждения оплаты',
  laterTip:'Оплату можно выполнить позднее по инструкции клиники.',pendingTip:'Если вы произвели оплату, сообщите об этом сотруднику клиники. В прототипе невозможно подтвердить поступление платежа.',
  amountInfo:'Сумма не рассчитана в демо-версии. Для реальной оплаты нужна интеграция с тарифами и платежами.',
  ticketLabel:'Демо-заявка',errorMethod:'Выберите Kaspi QR.'
 },
 kz:{
  title:'Қалай төлегіңіз келеді?',subtitle:'Өтінім рәсімделді. Төлем тәсілін таңдаңыз.',
  now:'Қазір төлеу',nowDescription:'Kaspi QR арқылы төлеу',
  later:'Кейін төлеу',laterDescription:'Қазір төлем жасамай рәсімдеуді аяқтау',
  continue:'Жалғастыру',choose:'Төлем нұсқасын таңдаңыз.',
  methodTitle:'Төлем тәсілін таңдаңыз',methodSubtitle:'Қазір Kaspi QR арқылы төлеуге болады',
  kaspi:'Kaspi QR',kaspiDescription:'Kaspi.kz қосымшасы арқылы төлем',
  scanTitle:'Kaspi қосымшасында QR-кодты сканерлеңіз',scanDescription:'Басқа құрылғыда Kaspi.kz ашып, төлемге арналған QR-кодты сканерлеңіз.',
  qrCaution:'Бұл демонстрацияға берілген QR-код. Нақты төлем алдында Kaspi қосымшасында алушыны және соманы тексеріңіз.',
  qrVerify:'Прототип төлемді тексермейді. Рәсімдеу аяқталса да, төлем мәртебесі «Растауды күтуде» болып қалады.',
  finish:'Рәсімдеуді аяқтау',payLaterInstead:'Кейін төлеймін',
  statusLabel:'Төлем мәртебесі',laterStatus:'Төленбеген · кейін төлеу',pendingStatus:'Төлем расталуын күтуде',
  laterTip:'Төлемді кейін клиника нұсқаулығы бойынша жасауға болады.',pendingTip:'Төлем жасасаңыз, клиника қызметкеріне хабарлаңыз. Прототип төлемнің түскенін растай алмайды.',
  amountInfo:'Демо нұсқада төлем сомасы есептелмейді. Нақты төлем үшін тарифтер мен төлем жүйесін қосу керек.',
  ticketLabel:'Тест өтінімі',errorMethod:'Kaspi QR таңдаңыз.'
 },
 en:{
  title:'When would you like to pay?',subtitle:'Application prepared. Select your payment preference.',
  now:'Pay now',nowDescription:'Proceed to Kaspi QR payment',
  later:'Pay later',laterDescription:'Finish registration without paying now',
  continue:'Continue',choose:'Choose when you would like to pay.',
  methodTitle:'Choose a payment method',methodSubtitle:'Kaspi QR is available for immediate payment',
  kaspi:'Kaspi QR',kaspiDescription:'Pay with the Kaspi.kz app',
  scanTitle:'Scan this QR code in Kaspi',scanDescription:'Open Kaspi.kz on another device and scan the QR code to pay.',
  qrCaution:'This QR was supplied for demonstration. Verify the recipient and amount inside Kaspi before making an actual payment.',
  qrVerify:'This prototype cannot verify payments. Even after completion, the payment will remain “Awaiting confirmation”.',
  finish:'Finish registration',payLaterInstead:'Pay later instead',
  statusLabel:'Payment status',laterStatus:'Unpaid · pay later',pendingStatus:'Awaiting payment confirmation',
  laterTip:'You can pay later following the clinic’s instructions.',pendingTip:'If you have paid, inform clinic staff. This prototype cannot verify receipt of funds.',
  amountInfo:'Payment amount is not calculated in the demo. Live payments require pricing and payment integration.',
  ticketLabel:'Demo application',errorMethod:'Select Kaspi QR.'
 }
};
const payText = () => PAYMENT_TEXT[state.lang] || PAYMENT_TEXT.ru;

function allergenName(item){return item.names?.[state.lang] || item.names?.ru || item.id;}
function allergenPrice(item){const value=Number(item?.priceKzt ?? DEMO_ALLERGEN_PRICE_KZT);return Number.isFinite(value)&&value>=0?value:DEMO_ALLERGEN_PRICE_KZT;}
function allergenTotal(){return state.allergens.reduce((sum,id)=>sum+allergenPrice(ALLERGENS.find(item=>item.id===id)),0);}
function formatKzt(value){return `${new Intl.NumberFormat(state.lang==='en'?'en-US':state.lang==='kz'?'kk-KZ':'ru-RU').format(value)} ₸`;}
function allergenSummary(){const t=allergenUI();return `<div class="allergen-total" id="allergenTotal" aria-live="polite"><span>${esc(t.totalLabel)} <small>(${state.allergens.length})</small></span><strong>${esc(formatKzt(allergenTotal()))}</strong></div><p class="allergen-price-note">${esc(t.priceNote)}</p>`;}


const QUESTION_TEXT_RU = [
  'Беременность',
  'Наследственность',
  'Аллергические проявления',
  'Индивидуальная непереносимость лекарственных препаратов и продуктов питания',
  'Потребление табачных изделий',
  'Злоупотребление алкоголем',
  'Злоупотребление наркотическими средствами',
  'Перенесенные травмы, операции, заболевания, обезболивание и иные медицинские вмешательства',
  'Экологические и производственные факторы физической, химической или биологической природы, воздействующие на меня (лица, законным представителем которого я являюсь) во время жизнедеятельности',
  'Принимаемые лекарственные средства (при наличии указать). В случае невозможности отмены приема лекарственных средств обязуюсь заранее сообщить об этом сотрудникам клиники и медицинской сестре при сдаче анализа',
  'Соблюдение подготовки к сдаче анализа «Аллергопробы», а именно подтверждаю, что за 2–3 суток до сдачи анализа исключил(а) прием витаминов, БАДов, противоаллергических препаратов, иммуносупрессивных препаратов, алкоголя и энергетических напитков'
];
// Полный текст согласия из сообщения заказчика. Не изменять без утверждения клиникой.
const CONSENT_CLAUSES = [
  { title: 'Информация о вмешательстве и возможных рисках', text: 'Я информирован(а) о целях, характере, неблагоприятных эффектах планируемого инвазивного вмешательства, согласен(на) со всеми подготовительными и сопровождающими возможными анестезиологическими мероприятиями, а также с необходимыми побочными вмешательствами. Я предупрежден(а), что во время инвазивного вмешательства могут возникнуть непредвиденные обстоятельства, риски и осложнения и понимаю, что это может включать нарушения со стороны сердечно-сосудистой, нервной, дыхательной и других систем жизнедеятельности организма, что это связано с непреднамеренным причинением вреда здоровью. В таком случае, я согласен(на) на применение врачами всевозможных методов лечения, направленных на устранение вышеуказанных осложнений.' },
  { title: 'Сведения о состоянии здоровья', text: 'Я ставлю в известность врача обо всех проблемах, связанных с моим здоровьем, включая сведения о беременности, наследственности, аллергических проявлениях, индивидуальной непереносимости лекарственных препаратов и продуктов питания, потреблении табачных изделий, злоупотреблении алкоголем, наркотическими средствами, перенесенных травмах, операциях, заболеваниях, обезболивании, иных медицинских вмешательствах, принимаемых лекарственных средствах, а также иных обстоятельствах, которые могут иметь значение для проведения исследования и оценки его результата.' },
  { title: 'Подготовка к исследованию', text: 'Я подтверждаю, что ознакомлен(а) с требованиями подготовки к исследованию, включая необходимость соблюдения диеты, ограничения по приему лекарственных препаратов и иные условия, имеющие значение для достоверности результата исследования. Мне разъяснено и понятно, что при наличии обстоятельств, указанных в пункте 2 настоящего согласия, а также при несоблюдении рекомендаций по подготовке, результат исследования может быть искажен, в том числе может являться ложно-положительным, ложно-отрицательным, либо иным образом недостоверным. Я осознаю указанные риски и принимаю на себя ответственность за полноту и достоверность сообщенных мною сведений о состоянии здоровья, принимаемых препаратах, соблюдении диеты и иных обстоятельств, способных повлиять на результат исследования. В случае если мной не сообщены такие сведения либо не соблюдены требования подготовки, я понимаю, что достоверность результата исследования не может быть гарантирована.' },
  { title: 'Особенности метода РСАЛ и допустимая погрешность', text: 'Я уведомлен(а) о том, что применяемый метод исследования РСАЛ, как и любой лабораторный метод диагностики, не обеспечивает 100% точности результата и допускает наличие определенной вероятности погрешности, связанной с индивидуальными особенностями организма, стадией заболевания, подготовкой к исследованию, влиянием внешних факторов, а также иными объективными обстоятельствами. Мне разъяснено, что результат данного исследования подлежит оценке врачом в совокупности с клинической картиной, анамнезом и при необходимости с результатами иных методов диагностики. С указанными особенностями метода исследования согласен(на), претензий к медицинской организации, связанных исключительно с допустимой погрешностью метода исследования, не имею и в дальнейшем иметь не буду.' },
  { title: 'Отсутствие направления врача', text: 'В случае отсутствия направления от врача, я подтверждаю, что согласен(на) с заказанными мною или лицом, законным представителем которого я являюсь, лечебно-диагностическими мероприятиями / исследованиями, перечисленными в чеке-направлении, и претензий по обоснованности их назначения предъявлять не буду.' },
  { title: 'Возможность задать вопросы', text: 'Я подтверждаю, что мне была предоставлена возможность задать любые вопросы о характере процедуры, возможных рисках и порядке использования результатов, и на все заданные вопросы я получил(а) понятные и исчерпывающие ответы.' },
  { title: 'Персональные данные и медицинская тайна', text: 'Настоящим подтверждаю, что даю согласие на сбор, обработку, передачу персональных данных и сведений, составляющих тайну медицинского работника, третьим лицам, для проведения научных исследований, использования этих сведений в учебном процессе, в том числе представление сведений о состоянии здоровья, для формирования электронных информационных ресурсов.' },
  { title: 'Фото-, видео- и аудиофиксация', text: 'Я информирован(а) о возможном проведении фото- и видеосъемки с функцией аудиозаписи, в целях контроля качества обслуживания и обеспечения безопасности.' },
  { title: 'Добровольное согласие', text: 'Я ознакомлен(а) со всеми пунктами настоящего документа, содержание мне понятно, с условиями согласен(на), согласие даю добровольно.' },
  { title: 'Разъяснение по Кодексу РК', text: 'В соответствии со статьями 77, 134 Кодекса Республики Казахстан «О здоровье народа и системе здравоохранения» содержание настоящего документа разъяснено, полностью мне понятно.' },
];
const PROCEDURE_RU = 'Забор биоматериалов (крови, мазков и т. п.) на общеклинические, лабораторные исследования.';
const ic = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.1 10a16 16 0 0 0 6.9 6.9l1.5-1.9a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  flask:'<path d="M9 3h6M10 3v7l-5.4 8.3A2.3 2.3 0 0 0 6.5 22h11a2.3 2.3 0 0 0 1.9-3.7L14 10V3M8 15h8"/>',
  microscope:'<path d="m6 18 5-5m3-10 5 5m-6-5 6 6m-8-6 4-2 6 6-2 4-6-6-4 2zM8 22h11M4 18a6 6 0 0 0 6 4"/>',
  droplet:'<path d="M12 22a8 8 0 0 0 8-8c0-5-8-12-8-12S4 9 4 14a8 8 0 0 0 8 8Z"/>',
  network:'<circle cx="12" cy="12" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m6.5 6.5 4 4m3 0 4-4m-11 11 4-4m3 0 4 4"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  pen:'<path d="m16 5 3 3M4 20l4.5-1 11-11a2 2 0 0 0-3-3l-11 11L4 20Z"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  refresh:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
};
function icon(name, className='') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[name] || ic.info}</svg>`; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const ui = {
  ru:{
    step:(i,n)=>`Шаг ${i} из ${n}`, welcome:'Добро пожаловать!',welcomeSub:'Оформите заявку на исследование самостоятельно',start:'Начать оформление',
    phone:'Телефон',phoneTitle:'Введите номер телефона',phoneSub:'Номер нужен для связи по результатам исследования',phoneHint:'Номер Казахстана в формате +7 XXX XXX XX XX',
    subjectTitle:'На кого оформляется обследование?',self:'На себя',selfDesc:'Я являюсь пациентом и подписываю согласие самостоятельно',child:'На ребёнка или подопечного',childDesc:'Я являюсь родителем, опекуном или законным представителем',
    representativeTitle:'Данные законного представителя',representativeSub:'Укажите свои данные как родителя, опекуна или законного представителя.',patientTitle:'Данные пациента',childTitle:'Данные пациента (ребёнка)',patientSub:'Проверьте сведения из тестового РПН перед продолжением.',
    iin:'ИИН',iinLabel:'ИИН',iinChild:'ИИН ребёнка',iinRepresentative:'ИИН представителя', iinPlaceholder:'Введите ИИН — 12 цифр', demoRepresentative:'Тестовый ИИН представителя: 123456789012',demoChild:'Тестовый ИИН ребёнка: 160504500777',
    found:'Данные успешно получены из тестового РПН',checking:'Проверяем ИИН…',missing:'В тестовом РПН запись не найдена. Используйте тестовый ИИН, указанный ниже.',invalidIin:'Укажите ИИН — 12 цифр',
    verifyWarning:'Пожалуйста, внимательно проверьте данные перед продолжением оформления заявки.',name:'ФИО',dob:'Дата рождения',confirmed:'Данные верны',foreign:'Если иностранный гражданин, не резидент Республики Казахстан',childForeign:'Если у ребёнка нет ИИН (иностранный гражданин)',foreignBack:'Вернуться к вводу ИИН',
    foreignNote:'Ручной ввод для иностранных граждан. В демо-версии сведения не проверяются автоматически.',namePlaceholder:'Фамилия, имя и отчество',datePlaceholder:'ДД.ММ.ГГГГ',relation:'Степень родства',chooseRelation:'Выберите степень родства',relationItems:['Мать','Отец','Опекун','Попечитель','Иной законный представитель'],
    relationError:'Выберите степень родства.',sameIin:'Данные ребёнка совпадают с данными представителя. Укажите данные ребёнка, а не свои.',
    studiesTitle:'Выберите исследование',studiesSub:'Можно выбрать несколько исследований',studyCount:n=>`Выбрано: ${n}`,studyNames:['Аллергопроба (РСАЛ)','Аллергопроба (ИФА)','Риноцитограмма','ИФА (Общий)','Гормоны'],
    proceduresTitle:'Выбор процедур',proceduresSub:'Пожалуйста, дайте согласие на проведение необходимых процедур:',yes:'Да',no:'Нет',procWarning:'Без согласия на забор биоматериала выполнение выбранного исследования может быть невозможно. Сообщите об этом сотруднику клиники.',
    questionnaireTitle:'Анкета о состоянии здоровья',questionnaireSub:'Отметьте нужные пункты. Если поставили галочку, откроется поле для уточнения.',questionnaireMore:'Дополнительная анкета',questionDetail:'Укажите подробности (при наличии)',commentTitle:'Общее описание указанных выше проблем и особенностей, а также нарушенные правила подготовки:',commentPlaceholder:'Опишите подробно (при наличии)',notPrepared:'Соблюдение подготовки не подтверждено. Сообщите об этом сотруднику клиники до сдачи анализа.',
    consentTitle:'Подписание и подтверждение',consentLead:'Вы подтверждаете, что ознакомлены с целью, характером, возможными рисками и последствиями проводимых исследований и процедур, а также даёте добровольное информированное согласие.',consentName:'Информационное согласие',consentFull:'Полный текст всех пунктов без раскрывающихся блоков.',consentInstruction:'Перед подписанием внимательно ознакомьтесь со всеми пунктами информационного согласия. Подписание означает, что содержание документа вам понятно, вы согласны с условиями и подтверждаете согласие добровольно.',
    docProviso:'Ниже приведён предоставленный текст согласия. Для реального использования медицинская организация должна утвердить его и проверить актуальность правовых оснований.',
    signInstruction:'После ознакомления со всеми пунктами ниже необходимо поставить ручную подпись и отметить чекбокс добровольного подтверждения.',signature:'Подпись рукой',signatureHint:'Нарисуйте подпись пальцем или мышкой в поле ниже.',signaturePlaceholder:'Подпишите здесь',clear:'Очистить',unsigned:'Не подписано',signed:'Подписано',signatureInfo:'Подпись сохраняется в памяти прототипа как часть подтверждения.',consentCheck:'Основываясь на вышеизложенной информации, я самостоятельно и добровольно подтверждаю и подписываю данный документ',signButton:'Подписать документ',
    reviewTitle:'Проверьте заявку',patient:'Пациент',rep:'Законный представитель',study:'Исследования',procedure:'Согласие на процедуры',questionnaire:'Анкета',questionnaireDone:'Заполнена',infoConsent:'Информационное согласие',signStatus:'Подписано',submit:'Зарегистрировать',
    successTitle:'Заявка зарегистрирована!',number:'Номер заявки',successNote:'Ожидайте вызова в кабинет на забор материала.',home:'На главный экран',back:'Назад',next:'Продолжить',
    demoNotice:'Демо-режим: данные не отправляются на сервер и не создают реальную заявку.',lookupNotice:'Тестовый РПН работает локально. Реальных запросов к государственным системам нет.',translationNotice:'Полный текст согласия предоставлен на русском. Утверждённые переводы для KZ/EN в прототип не добавлены.',
    errorPhone:'Укажите корректный номер телефона.',errorRequired:'Заполните обязательные поля.',errorConfirm:'Подтвердите правильность данных.',errorStudy:'Выберите хотя бы одно исследование.',errorProcedure:'Выберите «Да» или «Нет» по процедуре.',errorSignature:'Сначала нарисуйте подпись рукой.',errorConsent:'Отметьте добровольное подтверждение.',errorCompleted:'Не все обязательные этапы завершены.',errorDate:'Укажите дату рождения в формате ДД.ММ.ГГГГ.',errorDetail:'Укажите подробности для выбранного пункта.',idle:'Сессия завершена из-за бездействия. Данные удалены из памяти страницы.'
  },
  kz:{
    step:(i,n)=>`${i}-қадам / ${n}`,welcome:'Қош келдіңіз!',welcomeSub:'Зерттеуге өтінімді өз бетіңізше рәсімдеңіз',start:'Рәсімдеуді бастау',
    phone:'Телефон',phoneTitle:'Телефон нөмірін енгізіңіз',phoneSub:'Зерттеу нәтижелері туралы байланысу үшін',phoneHint:'Қазақстан нөмірі: +7 XXX XXX XX XX',
    subjectTitle:'Зерттеу кімге рәсімделеді?',self:'Өзіме',selfDesc:'Мен пациентпін және өзім қол қоямын',child:'Балаға немесе қамқорлықтағы адамға',childDesc:'Мен ата-анасы, қамқоршысы немесе заңды өкілімін',
    representativeTitle:'Заңды өкілдің деректері',representativeSub:'Ата-ана, қамқоршы немесе заңды өкіл ретіндегі деректеріңізді көрсетіңіз.',patientTitle:'Пациент деректері',childTitle:'Пациент (бала) деректері',patientSub:'Жалғастырмас бұрын тестілік тізілім деректерін тексеріңіз.',
    iin:'ЖСН',iinLabel:'ЖСН',iinChild:'Баланың ЖСН',iinRepresentative:'Өкілдің ЖСН',iinPlaceholder:'12 таңбалы ЖСН енгізіңіз',demoRepresentative:'Өкілдің тест ЖСН: 123456789012',demoChild:'Баланың тест ЖСН: 160504500777',
    found:'Деректер тестілік тізілімнен алынды',checking:'ЖСН тексерілуде…',missing:'Тестілік тізілімде жазба табылмады. Төмендегі тест ЖСН пайдаланыңыз.',invalidIin:'12 таңбалы ЖСН енгізіңіз',
    verifyWarning:'Өтінімді жалғастырмас бұрын деректерді мұқият тексеріңіз.',name:'ТАӘ',dob:'Туған күні',confirmed:'Деректер дұрыс',foreign:'Егер шетел азаматы, ҚР резиденті болмаса',childForeign:'Егер баланың ЖСН болмаса (шетел азаматы)',foreignBack:'ЖСН енгізуге оралу',foreignNote:'Шетел азаматтарына арналған қолмен енгізу. Демонстрацияда деректер автоматты түрде тексерілмейді.',namePlaceholder:'Тегі, аты, әкесінің аты',datePlaceholder:'КК.АА.ЖЖЖЖ',relation:'Туыстық дәрежесі',chooseRelation:'Туыстық дәрежесін таңдаңыз',relationItems:['Анасы','Әкесі','Қамқоршы','Қорғаншы','Өзге заңды өкіл'],relationError:'Туыстық дәрежесін таңдаңыз.',sameIin:'Баланың және өкілдің ЖСН бірдей болмауы тиіс.',
    studiesTitle:'Зерттеуді таңдаңыз',studiesSub:'Бірнеше зерттеуді таңдауға болады',studyCount:n=>`Таңдалғаны: ${n}`,studyNames:['Аллергосынама (РСАЛ)','Аллергосынама (ИФА)','Риноцитограмма','ИФА (Жалпы)','Гормондар'],
    proceduresTitle:'Рәсімдерді таңдау',proceduresSub:'Қажетті рәсімдерді өткізуге келісім беріңіз:',yes:'Иә',no:'Жоқ',procWarning:'Биоматериал алуға келісім болмаса, зерттеу жүргізу мүмкін болмауы мүмкін. Клиника қызметкеріне хабарлаңыз.',
    questionnaireTitle:'Денсаулық жағдайы туралы сауалнама',questionnaireSub:'Қажетті тармақтарды белгілеңіз. Белгіленсе, нақтылау өрісі ашылады.',questionnaireMore:'Қосымша сауалнама',questionDetail:'Толығырақ жазыңыз (бар болса)',commentTitle:'Жоғарыда көрсетілген жағдайлар және дайындық талаптарының бұзылуы туралы қосымша мәлімет:',commentPlaceholder:'Толығырақ сипаттаңыз',notPrepared:'Дайындық сақталғаны расталмады. Талдау алдында клиника қызметкеріне хабарлаңыз.',
    consentTitle:'Қол қою және растау',consentLead:'Сіз зерттеулер мен рәсімдердің мақсаты, сипаты және ықтимал қауіптерімен танысқаныңызды растайсыз және ерікті ақпараттандырылған келісім бересіз.',consentName:'Ақпараттандырылған келісім',consentFull:'Барлық тармақтардың толық мәтіні бірден көрсетілген.',consentInstruction:'Қол қоюдан бұрын барлық тармақтармен танысыңыз.',docProviso:'Құжаттың толық мәтіні орыс тілінде ұсынылған. Бекітілген қазақша аударма ұсынылмаған.',signInstruction:'Барлық тармақтарды оқып шыққаннан кейін қол қойып, келісім құсбелгісін қойыңыз.',signature:'Қолтаңба',signatureHint:'Төмендегі өріске саусақпен немесе тінтуірмен қол қойыңыз.',signaturePlaceholder:'Осында қол қойыңыз',clear:'Өшіру',unsigned:'Қол қойылмаған',signed:'Қол қойылған',signatureInfo:'Қолтаңба демо жадында ғана сақталады.',consentCheck:'Құжатпен таныстым, түсіндім және өз еркіммен қол қоямын',signButton:'Құжатқа қол қою',
    reviewTitle:'Өтінімді тексеріңіз',patient:'Пациент',rep:'Заңды өкіл',study:'Зерттеулер',procedure:'Рәсімге келісім',questionnaire:'Сауалнама',questionnaireDone:'Толтырылған',infoConsent:'Ақпараттандырылған келісім',signStatus:'Қол қойылды',submit:'Тіркеу',successTitle:'Өтінім тіркелді!',number:'Өтінім нөмірі',successNote:'Биоматериал алуға шақыруды күтіңіз.',home:'Басты бетке',back:'Артқа',next:'Жалғастыру',demoNotice:'Демо: деректер серверге жіберілмейді, нақты өтінім жасалмайды.',lookupNotice:'Бұл жергілікті тестілік тізілім. Мемлекеттік жүйелерге қосылмайды.',translationNotice:'Бекітілген қазақша / ағылшынша заңдық аударма ұсынылмаған. Мәтін орыс тілінде.',
    errorPhone:'Дұрыс телефон нөмірін енгізіңіз.',errorRequired:'Міндетті өрістерді толтырыңыз.',errorConfirm:'Деректерді растаңыз.',errorStudy:'Кемінде бір зерттеуді таңдаңыз.',errorProcedure:'Рәсім үшін «Иә» немесе «Жоқ» таңдаңыз.',errorSignature:'Алдымен қол қойыңыз.',errorConsent:'Ерікті келісімді белгілеңіз.',errorCompleted:'Міндетті кезеңдер аяқталмаған.',errorDate:'Туған күнді КК.АА.ЖЖЖЖ форматында енгізіңіз.',errorDetail:'Таңдалған тармақ үшін түсініктеме енгізіңіз.',idle:'Әрекетсіздіктен сессия аяқталды. Деректер тазартылды.'
  },
  en:{
    step:(i,n)=>`Step ${i} of ${n}`,welcome:'Welcome!',welcomeSub:'Register for a laboratory examination yourself',start:'Start registration',
    phone:'Phone',phoneTitle:'Enter your phone number',phoneSub:'To contact you about the examination results',phoneHint:'Kazakhstan number: +7 XXX XXX XX XX',
    subjectTitle:'Who is the examination for?',self:'Myself',selfDesc:'I am the patient and will sign my own consent',child:'A child or dependent',childDesc:'I am the parent, guardian, or legal representative',
    representativeTitle:'Legal representative details',representativeSub:'Enter your details as the parent, guardian, or legal representative.',patientTitle:'Patient details',childTitle:'Child patient details',patientSub:'Check the demo registry details before continuing.',
    iin:'IIN',iinLabel:'IIN',iinChild:'Child’s IIN',iinRepresentative:'Representative’s IIN',iinPlaceholder:'Enter 12-digit IIN',demoRepresentative:'Representative demo IIN: 123456789012',demoChild:'Child demo IIN: 160504500777',
    found:'Details retrieved from demo registry',checking:'Checking IIN…',missing:'No record found in the demo registry. Use the demo IIN shown below.',invalidIin:'Enter a 12-digit IIN',
    verifyWarning:'Carefully verify these details before continuing.',name:'Full name',dob:'Date of birth',confirmed:'Details are correct',foreign:'For a foreign citizen who is not a Kazakhstan resident',childForeign:'If the child does not have an IIN (foreign citizen)',foreignBack:'Return to IIN entry',foreignNote:'Manual entry for foreign citizens. These details are not automatically verified in the demo.',namePlaceholder:'Full name',datePlaceholder:'DD.MM.YYYY',relation:'Relationship',chooseRelation:'Choose relationship',relationItems:['Mother','Father','Guardian','Custodian','Other legal representative'],relationError:'Select the relationship.',sameIin:'The child and representative must have different IINs.',
    studiesTitle:'Choose examinations',studiesSub:'You can select multiple examinations',studyCount:n=>`Selected: ${n}`,studyNames:['Allergy test (RSAL)','Allergy test (ELISA)','Rhinocytogram','ELISA (general)','Hormones'],
    proceduresTitle:'Procedure selection',proceduresSub:'Please consent to the required procedures:',yes:'Yes',no:'No',procWarning:'Without consent to collect biological material, the examination may not be possible. Inform clinic staff.',
    questionnaireTitle:'Health questionnaire',questionnaireSub:'Check applicable items. Checked items reveal a details field.',questionnaireMore:'Additional questionnaire',questionDetail:'Provide details, if applicable',commentTitle:'Other conditions, concerns, and deviations from preparation requirements:',commentPlaceholder:'Describe any relevant details',notPrepared:'Preparation has not been confirmed. Inform clinic staff before sample collection.',
    consentTitle:'Signing and confirmation',consentLead:'You confirm that you understand the purpose, nature and potential risks of the examinations and procedures and give voluntary informed consent.',consentName:'Informed consent',consentFull:'All clauses are displayed in full, without collapsible sections.',consentInstruction:'Read every item before signing.',docProviso:'The supplied full legal text is in Russian. No approved English translation was provided.',signInstruction:'After reading all clauses, draw your signature and check the voluntary confirmation box.',signature:'Handwritten signature',signatureHint:'Draw using your finger, mouse or stylus below.',signaturePlaceholder:'Sign here',clear:'Clear',unsigned:'Not signed',signed:'Signed',signatureInfo:'The signature stays only in demo browser memory.',consentCheck:'I have read and understood the document and voluntarily sign it',signButton:'Sign document',
    reviewTitle:'Review application',patient:'Patient',rep:'Legal representative',study:'Tests',procedure:'Procedure consent',questionnaire:'Questionnaire',questionnaireDone:'Completed',infoConsent:'Informed consent',signStatus:'Signed',submit:'Register',successTitle:'Application registered!',number:'Application number',successNote:'Please wait to be called for sample collection.',home:'Back to home',back:'Back',next:'Continue',demoNotice:'Demo: no information is sent to a server and no real registration occurs.',lookupNotice:'Local demo registry only; no government database access.',translationNotice:'The legal consent was supplied in Russian; approved KZ/EN translations are not available.',
    errorPhone:'Enter a valid phone number.',errorRequired:'Complete required fields.',errorConfirm:'Please confirm the details.',errorStudy:'Select at least one examination.',errorProcedure:'Select Yes or No for the procedure.',errorSignature:'Draw your signature first.',errorConsent:'Check the voluntary consent box.',errorCompleted:'Required steps remain incomplete.',errorDate:'Enter date of birth as DD.MM.YYYY.',errorDetail:'Provide details for this selection.',idle:'Session ended due to inactivity. Data has been cleared.'
  }
};
const stepsFor = subject => {
  const steps = subject === 'child'
    ? ['phone','subject','representative','patient',FLOW_MODE==='allergens'?'allergens':'studies','procedures','questionnaireA','questionnaireB','consent','review']
    : ['phone','subject','patient',FLOW_MODE==='allergens'?'allergens':'studies','procedures','questionnaireA','questionnaireB','consent','review'];
  // Оплата доступна только в дополнительном сценарии с выбором аллергенов.
  if(FLOW_MODE==='allergens') steps.push('paymentChoice','paymentKaspi');
  return [...steps,'success'];
};
const newPerson = () => ({iin:'', name:'', dob:'', foreign:false, verified:false, confirmed:false, status:'idle'});
function fresh(lang='ru') {
  return {lang, step:'welcome', phone:'', subject:'self', people:{representative:newPerson(),patient:newPerson()},relation:'',studies:[],allergens:[],allergenQuery:'',allergenCategory:'all',procedure:null,checks:{},details:{},comment:'',consent:false,strokes:[],signed:false,ticket:'',paymentPlan:null,paymentMethod:null,paymentStatus:null};
}
let state=fresh();
let activePointer=null, toastTimeout=null, idleTimeout=null, lookupTimeout=null;
const screen=document.getElementById('screen');
const progressMount=document.getElementById('progressMount');
const toast=document.getElementById('toast');
const tr=()=>ui[state.lang];
const childMode=()=>state.subject==='child';
const sequence=()=>stepsFor(state.subject);
function demoRecord(key) { return DEMO_RPN[key==='representative'?'representative':childMode()?'child':'representative']; }
function phoneDigits(value) { let d=String(value||'').replace(/\D/g,''); if(d.length>=11&&'78'.includes(d[0])) d=d.slice(1); return d.slice(0,10); }
function prettyPhone(value) { const d=phoneDigits(value);return d?`+7 ${d.slice(0,3)}${d.length>3?' '+d.slice(3,6):''}${d.length>6?' '+d.slice(6,8):''}${d.length>8?' '+d.slice(8,10):''}`:''; }
function isValidDob(value) { if(!/^\d{2}\.\d{2}\.\d{4}$/.test(value))return false;const [dd,mm,yyyy]=value.split('.').map(Number);const date=new Date(Date.UTC(yyyy,mm-1,dd));return date.getUTCFullYear()===yyyy&&date.getUTCMonth()===mm-1&&date.getUTCDate()===dd&&date<=new Date()&&yyyy>=1900; }
function resetIdle() { clearTimeout(idleTimeout);if(state.step==='welcome')return; idleTimeout=setTimeout(()=>{const lang=state.lang;clearTimeout(lookupTimeout);state=fresh(lang);render();warn(tr().idle);},10*60*1000); }
['pointerdown','keydown','input','change','click','scroll'].forEach(evt=>document.addEventListener(evt,resetIdle,{passive:true}));
function warn(text) { toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),4200); }
function focusFirst(id) { const input=document.getElementById(id);input?.focus({preventScroll:true});input?.scrollIntoView?.({behavior:'smooth',block:'center'}); }
function progress() {
  if(state.step==='welcome'){progressMount.innerHTML='';return;}
  const steps=sequence().filter(s=>s!=='success');const index=state.step==='success'?steps.length:steps.indexOf(state.step)+1;
  progressMount.innerHTML=`<div class="progress-wrap"><div class="step-label">${esc(tr().step(index,steps.length))}</div><div class="progress-track" style="--steps:${steps.length}" role="progressbar" aria-valuemin="1" aria-valuemax="${steps.length}" aria-valuenow="${index}" aria-label="${esc(tr().step(index,steps.length))}">${steps.map((_,i)=>`<span class="progress-part ${i<index?'filled':''}"></span>`).join('')}</div></div>`;
}
function heading(title,sub='') { return `<div class="screen-heading"><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>`; }
function actions(next=tr().next,kind='next') { return `<div class="step-actions"><button class="btn btn-secondary" type="button" data-action="back">${esc(tr().back)}</button><button class="btn btn-primary" type="button" data-action="${kind}">${esc(next)}</button></div><p class="fineprint">${esc(tr().demoNotice)}</p>`; }
function textInput(id, label, value, type='text', placeholder='',iconName='card'){
  return `<label class="field-label" for="${id}">${esc(label)} <span class="required">*</span></label><div class="field-shell" id="${id}Shell">${icon(iconName,'field-icon')}<input class="text-field" id="${id}" type="text" inputmode="${type==='tel'?'tel':type==='numeric'?'numeric':'text'}" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}" ${type==='numeric'?'maxlength="12"':''}/><button class="clear-button" type="button" data-clear="${id}" aria-label="${esc(tr().clear)}">${icon('x')}</button></div>`;
}
function successLine(text){return `<div class="validation-ok">${icon('check')} <span>${esc(text)}</span></div>`;}
function fieldDetail(key,label,value){return `<div class="auto-field"><span class="auto-label">${esc(label)}</span><strong>${esc(value||'—')}</strong></div>`;}
function renderWelcome() {
 const alt = FLOW_MODE === 'allergens';
 const title = alt ? allergenUI().welcome : tr().welcome;
 const subtitle = alt ? allergenUI().subtitle : tr().welcomeSub;
 return `<section class="welcome"><div class="welcome-logo-wrap"><img class="clinic-logo" src="assets/clinic-emblem.png" alt="Логотип Республиканского центра клинико-лабораторных исследований"/></div><div class="welcome-copy"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="welcome-footer"><button type="button" class="btn btn-primary btn-full" data-action="start">${esc(tr().start)} ${icon('arrow')}</button><a class="flow-switch" href="${alt?'index.html':'allergens.html'}">${alt?esc(allergenUI().openOther):esc(allergenUI().other)} ${icon('arrow')}</a><p class="fineprint">${esc(tr().demoNotice)}</p></div></section>`;
}
function renderPhone() {return `${heading(tr().phoneTitle,tr().phoneSub)}<div class="screen-content compact">${textInput('phone',tr().phone,prettyPhone(state.phone),'tel','+7 701 123 45 67','phone')}<p class="field-help">${esc(tr().phoneHint)}</p></div>${actions()}`;}
function renderSubject() {
 return `${heading(tr().subjectTitle)}<div class="screen-content compact"><div class="selection-list">${[['self',tr().self,tr().selfDesc,'user'],['child',tr().child,tr().childDesc,'users']].map(([id,title,detail,ico])=>`<button type="button" class="select-card ${state.subject===id?'active':''}" data-subject="${id}" aria-pressed="${state.subject===id}"><span class="radio-ring"></span>${icon(ico,'choice-icon')}<span class="choice-text"><span class="choice-title">${esc(title)}</span><span class="choice-description">${esc(detail)}</span></span></button>`).join('')}</div></div>${actions()}`;
}
function personKind() {return state.step==='representative'?'representative':'patient';}
function renderPerson() {
  const key=personKind(),p=state.people[key],t=tr();const demo=demoRecord(key);
  const title=key==='representative'?t.representativeTitle:childMode()?t.childTitle:t.patientTitle;
  const subtitle=key==='representative'?t.representativeSub:t.patientSub;
  const label=key==='representative'?t.iinRepresentative:childMode()?t.iinChild:t.iinLabel;
  const recordAvailable=p.status==='found'&&!p.foreign;
  let info='';
  if(p.status==='loading')info=`<div class="lookup-message">${icon('refresh')} ${esc(t.checking)}</div>`;
  else if(p.status==='same'&&!p.foreign) info=`<div class="validation-error">${icon('info')} ${esc(t.sameIin)}</div>`;
  else if(p.status==='missing'&&!p.foreign) info=`<div class="validation-error">${icon('info')} ${esc(t.missing)}</div>`;
  else if(recordAvailable) info=`${successLine(t.found)}<div class="patient-warning">${icon('info')}<span>${esc(t.verifyWarning)}</span></div>`;
  const manual=`${textInput(`${key}Name`,t.name,p.name,'text',t.namePlaceholder,'user')}${textInput(`${key}Dob`,t.dob,p.dob,'text',t.datePlaceholder,'calendar')}`;
  const confirmed=p.foreign?'<span class="tag-verified">'+esc(t.foreignNote)+'</span>':'';
  const legalHeader=key==='patient'?`<div class="legal-form-header"><p>Форма утверждена Приказом Министра здравоохранения и социального развития Республики Казахстан от 20 мая 2015 года № 364</p><h2>ПИСЬМЕННОЕ ДОБРОВОЛЬНОЕ СОГЛАСИЕ</h2><p>пациента при инвазивных вмешательствах, оказании первичной доврачебной и медико-санитарной помощи, квалифицированной медицинской помощи</p></div>`:'';
  return `${legalHeader}${heading(title,subtitle)}<div class="screen-content compact person-form"><div class="form-section">${!p.foreign?`${textInput(`${key}Iin`,label,p.iin,'numeric',t.iinPlaceholder,'card')}<p class="field-help">${esc(key==='representative'||!childMode()?t.demoRepresentative:t.demoChild)}</p>${info}`:''}${recordAvailable?`<div class="patient-data-grid">${fieldDetail(key,t.name,p.name)}${fieldDetail(key,t.dob,p.dob)}</div>`:''}${p.foreign?`${manual}<div class="note-inline">${icon('info')}<span>${confirmed}</span></div>`:''}<button class="foreign-option" type="button" data-action="toggle-foreign" data-person="${key}">${esc(p.foreign?t.foreignBack:key==='patient'&&childMode()?t.childForeign:t.foreign)} <span aria-hidden="true">›</span></button>${recordAvailable||p.foreign?`<label class="confirm-inline"><input type="checkbox" data-confirm="${key}" ${p.confirmed?'checked':''}/><span>${esc(t.confirmed)} <span class="required">*</span></span></label>`:''}${key==='representative'?`<label class="field-label" for="relation">${esc(t.relation)} <span class="required">*</span></label><select id="relation" class="form-select"><option value="">${esc(t.chooseRelation)}</option>${t.relationItems.map((str,i)=>`<option value="${i+1}" ${state.relation===String(i+1)?'selected':''}>${esc(str)}</option>`).join('')}</select>`:''}</div><div class="meta-line">${esc(t.lookupNotice)}</div></div>${actions()}`;
}
function renderStudies() {return `${heading(tr().studiesTitle,tr().studiesSub)}<div class="screen-content compact"><div class="studies-grid">${STUDIES.map((id,i)=>`<button class="study-card ${state.studies.includes(id)?'selected':''}" type="button" data-study="${id}" aria-pressed="${state.studies.includes(id)}"><span class="study-checkbox">${state.studies.includes(id)?icon('check'):''}</span><span class="study-icon">${icon(['flask','flask','microscope','droplet','network'][i])}</span><span class="study-name">${esc(tr().studyNames[i])}</span></button>`).join('')}</div><p class="study-counter">${esc(tr().studyCount(state.studies.length))}</p></div>${actions()}`;}
function allergensFiltered(){
 const q=state.allergenQuery.trim().toLocaleLowerCase();
 return ALLERGENS.filter(item => {
  if(state.allergenCategory!=='all' && item.category!==state.allergenCategory)return false;
  if(!q)return true;
  return [item.names?.ru,item.names?.kz,item.names?.en,allergenUI().categories[item.category]].some(s=>(s||'').toLocaleLowerCase().includes(q));
 });
}
function allergenRows(){
 const lang=allergenUI(), items=allergensFiltered();
 if(!items.length)return `<div class="allergen-empty">${icon('info')} ${esc(lang.empty)}</div>`;
 return items.map(item=>{
   const isSelected=state.allergens.includes(item.id);
   return `<button type="button" class="allergen-item ${isSelected?'selected':''}" data-allergen="${esc(item.id)}" aria-pressed="${isSelected}"><span class="allergen-tick">${isSelected?icon('check'):''}</span><span class="allergen-item-main"><strong>${esc(allergenName(item))}</strong><small>${esc(lang.categories[item.category]||item.category)}</small></span><span class="allergen-item-end"><strong class="allergen-card-price">${esc(formatKzt(allergenPrice(item)))}</strong>${isSelected?icon('check'):icon('arrow')}</span></button>`;
 }).join('');
}
function allergenSelectedPills(){
 const lang=allergenUI();
 if(!state.allergens.length) return `<p class="allergen-selected-placeholder">${esc(lang.none)}</p>`;
 return state.allergens.map(id=>{
  const item=ALLERGENS.find(a=>a.id===id);if(!item)return '';
  return `<button class="allergen-pill" type="button" data-remove-allergen="${esc(id)}" aria-label="${esc(lang.remove)}: ${esc(allergenName(item))}"><span>${esc(allergenName(item))}</span>${icon('x')}</button>`;
 }).join('');
}
function refreshAllergenPicker(){
 const result=document.getElementById('allergenResults');
 if(!result)return;
 result.innerHTML=allergenRows();
 const chips=document.getElementById('allergenSelectedPills');if(chips)chips.innerHTML=allergenSelectedPills();
 const count=document.getElementById('allergenSelectedCount');if(count)count.textContent=`${allergenUI().selected}: ${state.allergens.length}`;
 const sum=document.getElementById('allergenTotalContainer');if(sum)sum.innerHTML=allergenSummary();
 const total=document.getElementById('allergenResultCount');if(total)total.textContent=`${allergenUI().results}: ${allergensFiltered().length}`;
 document.querySelectorAll('[data-allergen-category]').forEach(node=>{
  const current=node.dataset.allergenCategory===state.allergenCategory;
  node.classList.toggle('active',current);
  node.setAttribute('aria-pressed',String(current));
 });
}
function renderAllergens(){
 const t=allergenUI();
 const cats=[['all',t.all],...Object.entries(t.categories)];
 return `${heading(t.title,t.help)}<div class="screen-content compact allergen-picker"><div class="allergen-search-wrap"><label class="sr-only" for="allergenSearch">${esc(t.search)}</label><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" id="allergenSearch" autocomplete="off" placeholder="${esc(t.search)}" value="${esc(state.allergenQuery)}"/></div><div class="allergen-categories" aria-label="${esc(t.title)}">${cats.map(([id,label])=>`<button type="button" data-allergen-category="${esc(id)}" class="allergen-category ${state.allergenCategory===id?'active':''}" aria-pressed="${state.allergenCategory===id}">${esc(label)}</button>`).join('')}</div><div class="allergen-list-head"><strong>${esc(t.title)}</strong><span id="allergenResultCount">${esc(t.results)}: ${allergensFiltered().length}</span></div><div class="allergen-list" id="allergenResults">${allergenRows()}</div><div class="allergen-selected" aria-live="polite"><div class="allergen-selected-head"><strong>${esc(t.chosen)}</strong><span id="allergenSelectedCount">${esc(t.selected)}: ${state.allergens.length}</span></div><div class="allergen-selected-pills" id="allergenSelectedPills">${allergenSelectedPills()}</div><div id="allergenTotalContainer">${allergenSummary()}</div></div><div class="allergen-notice">${icon('info')}<span>${esc(t.notice)}</span></div></div>${actions()}`;
}
function renderProcedures() { return `${heading(tr().proceduresTitle,tr().proceduresSub)}<div class="screen-content compact"><div class="question-card"><div class="question-title">1. ${esc(PROCEDURE_RU)}</div><div class="answer-row"><button type="button" class="answer-choice ${state.procedure==='yes'?'active':''}" data-procedure="yes" aria-pressed="${state.procedure==='yes'}">${esc(tr().yes)}</button><button type="button" class="answer-choice ${state.procedure==='no'?'active':''}" data-procedure="no" aria-pressed="${state.procedure==='no'}">${esc(tr().no)}</button></div></div>${state.procedure==='no'?`<div class="patient-warning">${icon('info')}<span>${esc(tr().procWarning)}</span></div>`:''}</div>${actions()}`; }
function questionCard(number) {
  const checked=!!state.checks[number],detail=state.details[number]||'';
  return `<div class="health-question" id="question-${number}"><label class="health-check"><input type="checkbox" data-question="${number}" ${checked?'checked':''}/><span>${number}. ${esc(QUESTION_TEXT_RU[number-1])}</span></label>${number<11?`<div class="health-detail ${checked?'':'hidden'}" id="healthDetail-${number}"><label for="detail-${number}" class="sr-only">${esc(tr().questionDetail)}</label><textarea id="detail-${number}" data-detail="${number}" rows="2" placeholder="${esc(tr().questionDetail)}">${esc(detail)}</textarea></div>`:''}</div>`;
}
function renderQuestionnaire() {
  const first=state.step==='questionnaireA';const start=first?1:6, end=first?5:11;
  return `${heading(first?tr().questionnaireTitle:tr().questionnaireMore,first?tr().questionnaireSub:'')}<div class="screen-content compact"><div class="health-list">${Array.from({length:end-start+1},(_,i)=>questionCard(start+i)).join('')}</div>${!first?`<label for="healthComment" class="comment-label">${esc(tr().commentTitle)}</label><textarea class="form-textarea" id="healthComment" rows="4" placeholder="${esc(tr().commentPlaceholder)}">${esc(state.comment)}</textarea>${!state.checks[11]?`<div class="soft-warning">${icon('info')}<span>${esc(tr().notPrepared)}</span></div>`:''}`:''}</div>${actions()}`;
}
function renderConsent() {
 const t=tr(); return `${heading(t.consentTitle,t.consentLead)}<div class="screen-content compact consent-flow"><div class="doc-kicker">${icon('file')} <span>${esc(t.consentName)}</span></div><p class="consent-subline">${esc(t.consentFull)}</p><div class="consent-intro">${esc(t.consentInstruction)}</div>${state.lang!=='ru'?`<div class="soft-warning">${icon('info')}<span>${esc(t.translationNotice)}</span></div>`:''}<div class="consent-clauses">${CONSENT_CLAUSES.map((c,i)=>`<section class="consent-clause"><span class="clause-index">${String(i+1).padStart(2,'0')}</span><div><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p></div></section>`).join('')}</div><p class="form-disclaimer">${esc(t.docProviso)}</p><div class="sign-section" id="signSection"><div class="sign-instruction">${esc(t.signInstruction)}</div><div class="signature-title"><div><h2>${esc(t.signature)}</h2><p>${esc(t.signatureHint)}</p></div><button type="button" class="signature-clear" data-action="clear-signature">${icon('refresh')} ${esc(t.clear)}</button></div><div class="signature-frame ${state.strokes.length?'has-signature':''}" id="signatureFrame"><div class="signature-placeholder">${esc(t.signaturePlaceholder)}</div><canvas id="signatureCanvas" class="signature-canvas" role="img" aria-label="${esc(t.signature)}"></canvas></div><div class="signature-status"><span id="signatureStatus" class="${state.strokes.length?'good':''}">${esc(state.strokes.length?t.signed:t.unsigned)}</span><span>${esc(t.signatureInfo)}</span></div><label class="confirm-inline consent-approval"><input type="checkbox" id="consentCheckbox" ${state.consent?'checked':''}/><span>${esc(t.consentCheck)}</span></label></div></div>${actions(t.signButton)}`;
}
function summaryLine(ico,label,value) {return `<div class="review-row">${icon(ico)}<div><div class="review-key">${esc(label)}</div><div class="review-val">${esc(value)}</div></div></div>`;}
function renderReview(){
 const t=tr(),p=state.people.patient,r=state.people.representative;
 return `${heading(t.reviewTitle)}<div class="screen-content compact"><div class="review-card">${summaryLine('user',t.patient,`${p.name} · ${p.dob} · ${p.iin||'—'}`)}${childMode()?summaryLine('users',t.rep,`${r.name} · ${r.iin||'—'} · ${t.relationItems[Number(state.relation)-1]||'—'}`):''}${summaryLine('phone',t.phone,prettyPhone(state.phone))}${FLOW_MODE==='allergens'?summaryLine('flask',allergenUI().label,state.allergens.map(id=>ALLERGENS.find(a=>a.id===id)).filter(Boolean).map(a=>allergenName(a)+' — '+formatKzt(allergenPrice(a))).join(', '))+summaryLine('card',allergenUI().totalLabel,formatKzt(allergenTotal())):summaryLine('flask',t.study,state.studies.map(id=>t.studyNames[STUDIES.indexOf(id)]).join(', '))}${summaryLine('file',t.procedure,state.procedure==='yes'?t.yes:t.no)}${summaryLine('file',t.questionnaire,`${t.questionnaireDone} · ${Object.values(state.checks).filter(Boolean).length} / 11`)}${summaryLine('pen',t.infoConsent,t.signStatus)}</div><div class="note-inline">${icon('info')}<span>${esc(t.demoNotice)}</span></div></div>${actions(t.submit,'submit')}`;
}

function renderPaymentChoice(){
 const t=payText();
 return `${heading(t.title,t.subtitle)}<div class="screen-content compact payment-content"><div class="payment-option-list">
  <button type="button" class="payment-option ${state.paymentPlan==='now'?'active':''}" data-payment-plan="now" aria-pressed="${state.paymentPlan==='now'}"><span class="radio-ring"></span><span class="payment-option-icon pay-now-icon">${icon('card')}</span><span class="payment-option-copy"><strong>${esc(t.now)}</strong><small>${esc(t.nowDescription)}</small></span>${icon('arrow','payment-option-arrow')}</button>
  <button type="button" class="payment-option ${state.paymentPlan==='later'?'active':''}" data-payment-plan="later" aria-pressed="${state.paymentPlan==='later'}"><span class="radio-ring"></span><span class="payment-option-icon">${icon('calendar')}</span><span class="payment-option-copy"><strong>${esc(t.later)}</strong><small>${esc(t.laterDescription)}</small></span>${icon('arrow','payment-option-arrow')}</button>
 </div><div class="payment-total-line"><div><small>${esc(allergenUI().totalLabel)}</small><strong>${esc(formatKzt(allergenTotal()))}</strong></div><span>${esc(allergenUI().priceNote)}</span></div><div class="payment-summary-hint">${icon('info')}<span>${esc(allergenUI().paymentNote)}</span></div>
 <div class="payment-ticket-info">${esc(t.ticketLabel)}: <strong>${esc(state.ticket)}</strong></div></div>${actions(t.continue,'continue-payment')}`;
}
function renderPaymentKaspi(){
 const t=payText(),chosen=state.paymentMethod==='kaspi';
 return `${heading(t.methodTitle,t.methodSubtitle)}<div class="screen-content compact payment-content">
 <button type="button" class="payment-option kaspi-payment-option ${chosen?'active':''}" data-payment-method="kaspi" aria-pressed="${chosen}"><span class="radio-ring"></span><span class="payment-option-icon pay-kaspi-icon">${icon('card')}</span><span class="payment-option-copy"><strong>${esc(t.kaspi)}</strong><small>${esc(t.kaspiDescription)}</small></span>${icon('arrow','payment-option-arrow')}</button>
 <div class="payment-total-line payment-total-qr"><div><small>${esc(allergenUI().totalLabel)}</small><strong>${esc(formatKzt(allergenTotal()))}</strong></div><span>${esc(allergenUI().paymentNote)}</span></div>
 ${chosen?`<section class="payment-qr-area" aria-label="${esc(t.scanTitle)}"><h2>${esc(t.scanTitle)}</h2><p>${esc(t.scanDescription)}</p><img class="kaspi-qr-image" src="assets/kaspi-qr.png" alt="Kaspi QR — изображение кода, предоставленное для демонстрации"/><div class="payment-warning">${icon('info')}<span>${esc(t.qrCaution)}</span></div><div class="payment-advice">${icon('info')}<span>${esc(t.qrVerify)}</span></div></section>`:''}
 <button type="button" class="payment-link" data-action="pay-later-instead">${esc(t.payLaterInstead)}</button></div>${actions(t.finish,'finish-payment')}`;
}

function renderSuccess(){return `<div class="finished"><div class="big-check">${icon('check')}</div><h1>${esc(tr().successTitle)}</h1><p class="finished-label">${esc(tr().number)}</p><div class="ticket-number">${esc(state.ticket)}</div>${FLOW_MODE==='allergens'?`<div class="payment-final-total"><span>${esc(allergenUI().totalLabel)}</span><strong>${esc(formatKzt(allergenTotal()))}</strong><small>${esc(allergenUI().priceNote)}</small></div><div class="payment-status-summary"><span>${esc(payText().statusLabel)}</span><strong class="${state.paymentStatus==='pending_verification'?'status-pending':'status-later'}">${icon('info')}${esc(state.paymentStatus==='pending_verification'?payText().pendingStatus:payText().laterStatus)}</strong><p>${esc(state.paymentStatus==='pending_verification'?payText().pendingTip:payText().laterTip)}</p></div>`:''}<div class="finished-message note-inline">${icon('info')}<span>${esc(tr().successNote)}</span></div></div><div class="finished-footer"><button class="btn btn-secondary btn-full" type="button" data-action="home">${icon('home')} ${esc(tr().home)}</button><p class="fineprint">${esc(tr().demoNotice)}</p></div>`;}
function render({keepScroll=false}={}) {
 const y=window.scrollY;
 document.documentElement.lang=state.lang==='kz'?'kk':state.lang;
 document.title=`Аллергопроба · ${state.step==='welcome'?(FLOW_MODE==='allergens'?allergenUI().welcome:tr().welcome):state.step==='success'?tr().successTitle:tr().step(sequence().indexOf(state.step)+1,sequence().length-1)}`;
 document.querySelectorAll('[data-lang]').forEach(el=>{el.classList.toggle('active',el.dataset.lang===state.lang);el.setAttribute('aria-pressed',String(el.dataset.lang===state.lang));});
 progress();
 const renderers={welcome:renderWelcome,phone:renderPhone,subject:renderSubject,representative:renderPerson,patient:renderPerson,studies:renderStudies,allergens:renderAllergens,procedures:renderProcedures,questionnaireA:renderQuestionnaire,questionnaireB:renderQuestionnaire,consent:renderConsent,review:renderReview,paymentChoice:renderPaymentChoice,paymentKaspi:renderPaymentKaspi,success:renderSuccess};
 screen.className=`screen ${state.step==='welcome'?'screen-welcome':''} ${['consent','questionnaireA','questionnaireB'].includes(state.step)?'screen-long':''}`;
 screen.innerHTML=`<div class="screen-stage">${(renderers[state.step]||renderWelcome)()}</div>`;
 if(state.step==='consent')requestAnimationFrame(drawSignature);
 if(keepScroll)window.scrollTo(0,y);else window.scrollTo({top:0,behavior:'instant'});
 resetIdle();
}
function autoLookup(key,raw){
 const person=state.people[key]; const digits=String(raw).replace(/\D/g,'').slice(0,12);
 clearTimeout(lookupTimeout);const previouslyFound=['found','missing','same'].includes(person.status);person.iin=digits;person.name='';person.dob='';person.verified=false;person.confirmed=false;
 person.status=digits.length===12?'loading':'idle';
 if(digits.length!==12){
   if(previouslyFound){render({keepScroll:true});focusFirst(`${key}Iin`);}
   return;
 }
 const expected=demoRecord(key);
 lookupTimeout=setTimeout(()=>{
  if(person.iin!==digits||person.foreign||state.people[key]!==person)return;
  if(key==='patient'&&childMode()&&digits===state.people.representative.iin){person.status='same';}
  else if(digits===expected.iin){Object.assign(person,{name:expected.name,dob:expected.dob,verified:true,status:'found'});} else person.status='missing';
  if(state.step===key || (key==='patient'&&state.step==='patient'))render({keepScroll:true});
 },380);
}
function validatePerson(key,silent=false){
 const p=state.people[key],t=tr();
 if(key==='patient'&&childMode()&&p.iin&&p.iin===state.people.representative.iin){if(!silent){warn(t.sameIin);focusFirst(`${key}Iin`);}return false;}
 if(!p.foreign&&(p.iin.length!==12||p.status!=='found'||!p.verified)){if(!silent){warn(p.iin.length!==12?t.invalidIin:t.missing);focusFirst(`${key}Iin`);}return false;}
 if(p.foreign&&(!p.name.trim()||!isValidDob(p.dob))){if(!silent){warn(!p.name.trim()?t.errorRequired:t.errorDate);focusFirst(!p.name.trim()?`${key}Name`:`${key}Dob`);}return false;}
 if(!p.confirmed){if(!silent)warn(t.errorConfirm);return false;}
 if(key==='representative'&&!state.relation){if(!silent){warn(t.relationError);focusFirst('relation');}return false;}
 if(key==='patient'&&childMode()&&p.iin&&p.iin===state.people.representative.iin){if(!silent){warn(t.sameIin);focusFirst(`${key}Iin`);}return false;}
 return true;
}
function validate(step,silent=false) {
 const t=tr(); const fail=(msg)=>{if(!silent)warn(msg);return false;};
 if(step==='phone'&&state.phone.length!==10)return fail(t.errorPhone);
 if(step==='representative'||step==='patient')return validatePerson(step,silent);
 if(step==='studies'&&!state.studies.length)return fail(t.errorStudy);
 if(step==='allergens'&&!state.allergens.length)return fail(allergenUI().error);
 if(step==='procedures'&&!state.procedure)return fail(t.errorProcedure);
 if(step==='questionnaireA'||step==='questionnaireB'){
  const range=step==='questionnaireA'?[1,2,3,4,5]:[6,7,8,9,10];
  for(const q of range){if(state.checks[q]&&(q===10)&&!(state.details[q]||'').trim())return fail(t.errorDetail);}
 }
 if(step==='consent'&&state.strokes.every(s=>s.length<2))return fail(t.errorSignature);
 if(step==='consent'&&!state.consent)return fail(t.errorConsent);
 return true;
}
function goNext(){if(['paymentChoice','paymentKaspi','success'].includes(state.step))return;if(!validate(state.step))return;const steps=sequence();const next=steps[steps.indexOf(state.step)+1];if(next==='review')state.signed=true;state.step=next||'success';render();}
function goBack(){const steps=sequence();const prev=steps[steps.indexOf(state.step)-1];state.step=prev||'welcome';if(state.step==='consent')state.signed=false;render();}
function submit(){const steps=sequence().filter(s=>!['success','review','paymentChoice','paymentKaspi'].includes(s));for(const step of steps){if(!validate(step,true)){warn(tr().errorCompleted);state.step=step;render();return;}}
 state.signed=true;state.ticket='AP-'+String(100000+Math.floor(Math.random()*900000));state.paymentPlan=null;state.paymentMethod=null;state.paymentStatus=null;state.step=FLOW_MODE==='allergens'?'paymentChoice':'success';render();}

function drawSignature(){
 const canvas=document.getElementById('signatureCanvas');if(!canvas)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
 const dpr=Math.min(devicePixelRatio||1,3);canvas.width=Math.ceil(rect.width*dpr);canvas.height=Math.ceil(rect.height*dpr);
 const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#2369a7';ctx.fillStyle='#2369a7';
 for(const points of state.strokes){if(!points.length)continue;if(points.length===1){ctx.beginPath();ctx.arc(points[0][0]*rect.width,points[0][1]*rect.height,1.5,0,Math.PI*2);ctx.fill();continue;}ctx.beginPath();ctx.moveTo(points[0][0]*rect.width,points[0][1]*rect.height);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0]*rect.width,points[i][1]*rect.height);ctx.stroke();}
 document.getElementById('signatureFrame')?.classList.toggle('has-signature',state.strokes.length>0);
 const label=document.getElementById('signatureStatus');if(label){label.textContent=state.strokes.length?tr().signed:tr().unsigned;label.classList.toggle('good',state.strokes.length>0);}
}
function point(e,canvas){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))];}
screen.addEventListener('pointerdown',e=>{if(e.target.id!=='signatureCanvas')return;e.preventDefault();activePointer=e.pointerId;state.strokes.push([point(e,e.target)]);e.target.setPointerCapture?.(e.pointerId);drawSignature();});
screen.addEventListener('pointermove',e=>{if(e.target.id!=='signatureCanvas'||activePointer!==e.pointerId)return;e.preventDefault();const stroke=state.strokes.at(-1);if(!stroke)return;const p=point(e,e.target),last=stroke.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>.001)stroke.push(p);drawSignature();});
screen.addEventListener('pointerup',e=>{if(activePointer===e.pointerId)activePointer=null;});
screen.addEventListener('pointercancel',e=>{if(activePointer===e.pointerId)activePointer=null;});
window.addEventListener('resize',()=>{if(state.step==='consent')requestAnimationFrame(drawSignature);});

document.addEventListener('click',e=>{
 const lang=e.target.closest('[data-lang]');if(lang){state.lang=lang.dataset.lang;render({keepScroll:true});return;}
 const subj=e.target.closest('[data-subject]');if(subj){const old=state.subject;state.subject=subj.dataset.subject;if(old!==state.subject){state.people={representative:newPerson(),patient:newPerson()};state.relation='';state.consent=false;state.strokes=[];state.signed=false;}render({keepScroll:true});return;}
 const clear=e.target.closest('[data-clear]');if(clear){const el=document.getElementById(clear.dataset.clear);if(el){el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}return;}
 const study=e.target.closest('[data-study]');if(study){const id=study.dataset.study;state.studies=state.studies.includes(id)?state.studies.filter(v=>v!==id):[...state.studies,id];study.classList.toggle('selected',state.studies.includes(id));study.setAttribute('aria-pressed',String(state.studies.includes(id)));study.querySelector('.study-checkbox').innerHTML=state.studies.includes(id)?icon('check'):'';document.querySelector('.study-counter').textContent=tr().studyCount(state.studies.length);return;}
 const allergen=e.target.closest('[data-allergen]');
 if(allergen && FLOW_MODE==='allergens'){
  const id=allergen.dataset.allergen;if(!ALLERGENS.some(item=>item.id===id))return;
  state.allergens=state.allergens.includes(id)?state.allergens.filter(v=>v!==id):[...state.allergens,id];
  refreshAllergenPicker();return;
 }
 const removeAllergen=e.target.closest('[data-remove-allergen]');
 if(removeAllergen && FLOW_MODE==='allergens'){
  state.allergens=state.allergens.filter(id=>id!==removeAllergen.dataset.removeAllergen);refreshAllergenPicker();return;
 }
 const category=e.target.closest('[data-allergen-category]');
 if(category && FLOW_MODE==='allergens'){
  state.allergenCategory=category.dataset.allergenCategory;refreshAllergenPicker();return;
 }
 const proc=e.target.closest('[data-procedure]');if(proc){state.procedure=proc.dataset.procedure;render({keepScroll:true});return;}
 const paymentPlan=FLOW_MODE==='allergens'?e.target.closest('[data-payment-plan]'):null;if(paymentPlan){state.paymentPlan=paymentPlan.dataset.paymentPlan;state.paymentMethod=null;render({keepScroll:true});return;}
 const paymentMethod=FLOW_MODE==='allergens'?e.target.closest('[data-payment-method]'):null;if(paymentMethod){state.paymentMethod=paymentMethod.dataset.paymentMethod;render({keepScroll:true});return;}
 const action=e.target.closest('[data-action]');if(!action)return;
 switch(action.dataset.action){case 'start':state.step='phone';render();break;case 'next':goNext();break;case 'back':goBack();break;case 'submit':submit();break;case 'home':state=fresh(state.lang);render();break;
 case 'continue-payment':if(!state.paymentPlan){warn(payText().choose);break;}if(state.paymentPlan==='now'){state.step='paymentKaspi';render();}else{state.paymentStatus='later';state.step='success';render();}break;
 case 'finish-payment':if(state.paymentMethod!=='kaspi'){warn(payText().errorMethod);break;}state.paymentStatus='pending_verification';state.step='success';render();break;
 case 'pay-later-instead':state.paymentPlan='later';state.paymentMethod=null;state.paymentStatus='later';state.step='success';render();break;
 case 'toggle-foreign':{const key=action.dataset.person,p=state.people[key];clearTimeout(lookupTimeout);p.foreign=!p.foreign;p.name='';p.dob='';p.iin='';p.status='idle';p.verified=false;p.confirmed=false;render({keepScroll:true});break;}
 case 'clear-signature':state.strokes=[];state.signed=false;drawSignature();break;}
});
screen.addEventListener('input',e=>{
 const el=e.target;if(el.id==='allergenSearch' && FLOW_MODE==='allergens'){state.allergenQuery=el.value;refreshAllergenPicker();}
 else if(el.id==='phone'){state.phone=phoneDigits(el.value);el.value=prettyPhone(state.phone);}
 else if(['representativeIin','patientIin'].includes(el.id)){const key=el.id.startsWith('representative')?'representative':'patient';const digits=el.value.replace(/\D/g,'').slice(0,12);el.value=digits;autoLookup(key,digits);}
 else if(['representativeName','patientName','representativeDob','patientDob'].includes(el.id)){const key=el.id.startsWith('representative')?'representative':'patient';state.people[key][el.id.endsWith('Name')?'name':'dob']=el.value;state.people[key].confirmed=false;}
 else if(el.matches('[data-detail]'))state.details[el.dataset.detail]=el.value;
 else if(el.id==='healthComment')state.comment=el.value;
});
screen.addEventListener('change',e=>{
 const el=e.target;
 if(el.matches('[data-confirm]'))state.people[el.dataset.confirm].confirmed=el.checked;
 if(el.id==='relation')state.relation=el.value;
 if(el.id==='consentCheckbox')state.consent=el.checked;
 if(el.matches('[data-question]')){const q=Number(el.dataset.question);state.checks[q]=el.checked;const detail=document.getElementById(`healthDetail-${q}`);if(detail){detail.classList.toggle('hidden',!el.checked);if(el.checked)detail.querySelector('textarea')?.focus({preventScroll:true});}if(q===11){const note=screen.querySelector('.soft-warning');if(note)note.style.display=el.checked?'none':'flex';}}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&['phone','representativeIin','patientIin'].includes(e.target.id)){e.preventDefault();goNext();}});
render();
