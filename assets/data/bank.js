// The exact 15 selected scenarios from RALLY_Operations_Technical_Interview_Board.pdf (page 2).
// Original TWIST/WATCH hints retained; the 36-question legacy bank is no longer active.
export const CRITERIA = [
    {
        "id": "c1",
        "label": "Operational Knowledge & Experience",
        "description": "فهم شغل Operations وخبرة عملية موثقة، حتى لو من نشاط بسيط",
        "weight": 15
    },
    {
        "id": "c2",
        "label": "Planning & Organization",
        "description": "تحويل الفكرة لخطة واضحة ومسؤوليات ومتابعة",
        "weight": 20
    },
    {
        "id": "c3",
        "label": "Problem Solving & Crisis Management",
        "description": "حل المشاكل من غير تضييع وقت أو تعريض حد للخطر",
        "weight": 20
    },
    {
        "id": "c4",
        "label": "Prioritization & Resource Management",
        "description": "ترتيب المهم والعاجل وتوزيع الوقت والناس والميزانية",
        "weight": 15
    },
    {
        "id": "c5",
        "label": "Decision Making & Escalation",
        "description": "اتخاذ قرارات مبررة ومعرفة حدود الصلاحيات",
        "weight": 15
    },
    {
        "id": "c6",
        "label": "Coordination & Accountability",
        "description": "التعامل مع الأطراف المختلفة وتحمل المسؤولية والمتابعة",
        "weight": 15
    }
];
export const QUESTIONS = [
    {
        "id": "OP-01",
        "kind": "E",
        "category": "الفهم والخبرة",
        "criterionId": "c1",
        "text": "احك عن فعالية شاركت في تنظيمها، وحدد مسؤولياتك الفعلية والقرارات التي اتخذتها بنفسك.",
        "twist": "إيه قرار أخدته بنفسك؟ وإيه كان هيحصل لو ما أخدتوش؟",
        "watch": "دور حقيقي + تفاصيل قابلة للتحقق.",
        "boardNumber": 1
    },
    {
        "id": "OP-02",
        "kind": "Q",
        "category": "الفهم والخبرة",
        "criterionId": "c1",
        "text": "أنت مسؤول Operations عن فعالية بعد أسبوعين. ما أول خمس نقاط ستراجعها قبل اعتماد خطة التنفيذ؟",
        "twist": "المكان اتحجز. هل كده إحنا جاهزين؟",
        "watch": "فهم مراحل التجهيز والمخاطر.",
        "boardNumber": 2
    },
    {
        "id": "OP-07",
        "kind": "L",
        "category": "التخطيط والتنظيم",
        "criterionId": "c2",
        "text": "لدينا Workshop لـ60 مشاركًا بعد ثلاثة أيام، ومعك أربعة أعضاء. ضع خطة تشغيل وتوزيع مهام مختصرة.",
        "twist": "واحد من الأربعة اعتذر. هتعدل الخطة إزاي؟",
        "watch": "تقسيم مهام + متابعة + بديل.",
        "boardNumber": 3
    },
    {
        "id": "OP-08",
        "kind": "L",
        "category": "التخطيط والتنظيم",
        "criterionId": "c2",
        "text": "نحتاج إلى تنظيم 30 Offline Interview في يوم واحد باستخدام لجنتين وغرفة انتظار. كيف ستنظم حركة المتقدمين؟",
        "twist": "Panel اتأخرت 20 دقيقة، واتنين Applicants وصلوا متأخر.",
        "watch": "Flow واضح ومنع التكدس.",
        "boardNumber": 4
    },
    {
        "id": "OP-10",
        "kind": "L",
        "category": "التخطيط والتنظيم",
        "criterionId": "c2",
        "text": "أنت مسؤول عن Helpdesk مدته ساعتان يتضمن التعريف بـRALLY وتسجيل البيانات وأنشطة تفاعلية. كيف ستوزع الأدوار وتنظم سير العمل؟",
        "twist": "اتكون طابور 35 شخص وموظف التسجيل غاب.",
        "watch": "تصميم Workflow مرن.",
        "boardNumber": 5
    },
    {
        "id": "OP-13",
        "kind": "L",
        "category": "حل المشاكل وإدارة الأزمات",
        "criterionId": "c3",
        "text": "قبل بدء Session بـ15 دقيقة: 40 حاضرًا، 25 كرسيًا، Projector معطل، وSpeaker متأخر. ما خطة تصرفك؟",
        "twist": "الـVenue رافض يزود كراسي والممرات لازم تفضل فاضية.",
        "watch": "سلامة + ترتيب الأولويات + بدائل.",
        "boardNumber": 6
    },
    {
        "id": "OP-15",
        "kind": "L",
        "category": "حل المشاكل وإدارة الأزمات",
        "criterionId": "c3",
        "text": "انقطع الإنترنت أثناء تسجيل الحضور باستخدام QR Codes، وبدأ يتكون طابور عند المدخل. كيف ستستمر في التسجيل؟",
        "twist": "النت رجع. هتدمج التسجيلات اليدوية من غير تكرار؟",
        "watch": "استمرارية التشغيل ودقة البيانات.",
        "boardNumber": 7
    },
    {
        "id": "OP-16",
        "kind": "R",
        "category": "حل المشاكل وإدارة الأزمات",
        "criterionId": "c3",
        "text": "أنا مسؤول الـVenue، وأبلغك الآن أن القاعة المحجوزة لم تعد متاحة قبل الفعالية بساعتين. تفاوض معي لحل الموقف.",
        "twist": "أقدر أوفر قاعة بنصف السعة بس.",
        "watch": "تفاوض وخطة بديلة وحدود السعة.",
        "boardNumber": 8
    },
    {
        "id": "OP-19",
        "kind": "L",
        "category": "إدارة الأولويات والموارد",
        "criterionId": "c4",
        "text": "معك عضوان فقط، وعليك تجهيز الـStage، وتنظيم Registration، واستقبال Speaker، ومراجعة القاعة. كيف توزع الأولويات؟",
        "twist": "واحد جديد ومش بيعرف يتعامل مع الـSpeakers.",
        "watch": "توزيع ملائم للخبرة والأهمية.",
        "boardNumber": 9
    },
    {
        "id": "OP-22",
        "kind": "L",
        "category": "إدارة الأولويات والموارد",
        "criterionId": "c4",
        "text": "قبل بدء الفعالية بـ20 دقيقة، لم تُرتب المقاعد، ولم يصل الـGuest، ولم تجهز منطقة التسجيل. ما ترتيب خطواتك؟",
        "twist": "الـPresident طلب منك تسيب كله وتستقبله بنفسك.",
        "watch": "التفويض والترتيب بدون إهمال المهم.",
        "boardNumber": 10
    },
    {
        "id": "OP-25",
        "kind": "R",
        "category": "القرار والتصعيد",
        "criterionId": "c5",
        "text": "أنا رئيس الـSociety وأواجهك لأن تجهيزات الفعالية متأخرة والمكان غير مؤكد. بصفتك مسؤول Operations، رد عليّ بخطة واضحة.",
        "twist": "مش عايز تبريرات؛ عايز قرار وخطة واضحة دلوقتي.",
        "watch": "مسؤولية وهدوء وخطة بوقت محدد.",
        "boardNumber": 11
    },
    {
        "id": "OP-26",
        "kind": "R",
        "category": "القرار والتصعيد",
        "criterionId": "c5",
        "text": "يطلب منك المسؤول بدء الفعالية قبل تأكيد تصريح استخدام القاعة. ما قرارك، وكيف ستتعامل مع الطلب؟",
        "twist": "لو استنينا هنضيع الـEvent كله.",
        "watch": "رفض المخاطرة غير المقبولة والتصعيد السليم.",
        "boardNumber": 12
    },
    {
        "id": "OP-30",
        "kind": "R",
        "category": "القرار والتصعيد",
        "criterionId": "c5",
        "text": "أنا Vendor وأطلب مبلغًا إضافيًا دون فاتورة قبل تسليم المعدات بساعة. تفاوض معي بما يحفظ سير الفعالية.",
        "twist": "أنا الوحيد اللي عنده التجهيزات في الوقت ده.",
        "watch": "نزاهة وتفاوض وتصعيد مشروع.",
        "boardNumber": 13
    },
    {
        "id": "OP-31",
        "kind": "R",
        "category": "التنسيق وتحمل المسؤولية",
        "criterionId": "c6",
        "text": "أنا Member في فريقك ولم أسلم المهمة المطلوبة رغم انتهاء الموعد المحدد. تعامل معي الآن باعتبارك مسؤول المتابعة.",
        "twist": "لسه فاضل 70%، وعندي امتحان بكرة.",
        "watch": "متابعة بدون تجريح + إعادة توزيع.",
        "boardNumber": 14
    },
    {
        "id": "OP-33",
        "kind": "R",
        "category": "التنسيق وتحمل المسؤولية",
        "criterionId": "c6",
        "text": "أنا أحد الحضور، واسمي غير موجود في قائمة التسجيل وأطالب بالدخول فورًا. تعامل معي بصفتك مسؤول Registration.",
        "twist": "معايا Screenshot، بس القاعة وصلت السعة القصوى.",
        "watch": "تحقق واحترام سياسة السلامة.",
        "boardNumber": 15
    }
];