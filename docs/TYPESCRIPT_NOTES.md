# ملخص TypeScript من مشروع Kanban
كل الأسئلة يلي مرّت معنا أثناء بناء المشروع، مع الجواب والشرح، مرتبة حسب الفكرة.

---

## 1. الأنواع الأساسية

### س1: شو الفرق بين النوع العادي والـ Union؟
**الجواب:** الـ Union بيحدد **قيم معيّنة بس** مسموحة.

```ts
type Status = "todo" | "in-progress" | "done";
type Priority = "low" | "medium" | "high";
```

**الشرح:** لو كان `status: string`، كان ممكن تكتب أي نص، حتى لو غلط. أما مع الـ Union، أي قيمة برّا القائمة بتطلع خطأ فوراً.

**من تمرين "الكسر" (اليوم 1)، TypeScript مسك 4 أخطاء:**

| الخطأ | السبب |
|---|---|
| `priority: "urgent"` | مش من قيم `Priority` |
| مهمة بدون `title` | خاصية إلزامية ناقصة |
| `status: "Done"` | حرف كبير، والصح `"done"` |
| `PRIORITY_LABELS` ناقصه `low` | `Record` بيطلب **كل** المفاتيح |

> 💡 **الفكرة:** TypeScript بيمسك الأخطاء **وانت عم تكتب**، مش لما يفتح المستخدم الموقع.

---

### س2: شو بيعمل `Record<Priority, string>`؟
**الجواب:** object **لازم** يكون فيه مفتاح لكل قيمة من `Priority`، وكل قيمة نوعها `string`.

```ts
const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
```

**الشرح:** إذا نسيت مفتاح، أو ضفت `Priority` جديدة بيوم من الأيام، TypeScript بيقلك وين لازم تضيفها.

---

## 2. أدوات تحويل الأنواع (Utility Types)

### س3: ليش `NewTask` شايل `id` و`status` و`createdAt`؟ وشو بيعمل `Omit`؟
**الجواب:** `Omit<النوع, "خاصيات">` بيعمل نوع جديد = **النوع الأصلي ناقص الخاصيات المحددة**.

```ts
type NewTask = Omit<Task, "id" | "status" | "createdAt">;
// النتيجة: { title; description?; priority; dueDate? }
```

**الشرح:** `NewTask` هو **يلي المستخدم بيعبّيه بالفورم**. أما التلاتة التانيين، فالـ reducer هو يلي بيعطيهم قيمة:

```ts
id: crypto.randomUUID(),
status: "todo",
createdAt: new Date().toISOString(),
```

يعني المستخدم ما لازم يختار الـ id أو تاريخ الإنشاء، وTypeScript بيضمن هالشي.

**تمرين:** شو بيضل بـ `Omit<Task, "description" | "dueDate" | "createdAt">`؟
**الجواب:** `id` و`title` و`priority` و`status`.

---

### س4: ليش بـ `TaskUpdate` الـ `id` إلزامي، والباقي اختياري؟
```ts
type TaskUpdate = Partial<NewTask> & { id: string };
```

**الجواب:**
- `Partial` بيخلي **كل** الخاصيات اختيارية، مشان تقدر تعدّل خاصية وحدة بس (متل العنوان).
- بس الـ `id` لازم دايماً، لأنو **بدونه ما في طريقة نعرف أي مهمة المقصودة** (بالـ reducer عم نقارن `t.id === action.payload.id`).
- و`&` معناها **"وكمان"**: يعني النوعين مع بعض.

---

## 3. الـ Narrowing (تضييق النوع)

الـ Narrowing هو لما TypeScript **بيضيّق** نوع متغير بعد ما تتأكد منه. وشفناه بـ **4 طرق**:

### س5: بحالة `"MOVE_TASK"`، كيف عرف TypeScript إنو الـ payload فيه `status`؟
**الجواب:** بالـ **Discriminated Union**.

```ts
type TaskAction =
  | { type: "ADD_TASK"; payload: NewTask }
  | { type: "MOVE_TASK"; payload: { id: string; status: Status; beforeId?: string } }
  // ...
```

**الشرح:** الخاصية `type` اسمها **discriminant** (المميِّز). لما تكتب `case "MOVE_TASK":`، TypeScript بيعرف إنو `action` هو هالعضو بالذات من الـ Union، فبيعرف شكل الـ payload تبعه.

> **الطريقة 1:** `switch` على خاصية مميِّزة.

---

### س6: ليش TypeScript بيعترض على `editingTask.id` برا الـ `if`؟
```ts
const [editingTask, setEditingTask] = useState<Task | null>(null);

editingTask.id;      // ❌ 'editingTask' is possibly 'null'

if (editingTask) {
  editingTask.id;    // ✅
}
```

**الجواب:** نوعها `Task | null`. لو كانت `null`، فـ `null.id` بيكرّش التطبيق. جوّا الـ `if`، TypeScript بيعرف إنها مش `null`، فبيضيّق نوعها لـ `Task`.

> **الطريقة 2:** `if (x)` أو `if (!x) return`.

**نفس الشي صار بالـ reducer:**
```ts
const draggedTask = state.find((t) => t.id === id); // Task | undefined
if (!draggedTask) return state;
// من هون وطالع: draggedTask نوعها Task
```
`find` بترجّع `undefined` إذا ما لقت شي، فلازم نتأكد قبل ما نستعملها.

---

### س7: بـ `dragLeave`، ليش `contains(next)` بتعطي خطأ؟ وكيف حليناها؟
```ts
const next = e.relatedTarget; // EventTarget | null

if (next instanceof Node && e.currentTarget.contains(next)) return;
```

**الجواب:**
- `contains` بتقبل `Node` بس، و`next` نوعها `EventTarget | null`.
- `instanceof Node` بيتأكد **وقت التشغيل** إنها فعلاً `Node`، فـ TypeScript بيضيّق النوع.
- **الترتيب مهم:** الفحص أول، وبعدين الاستعمال.

**الغلطة يلي صارت:** كان الشرط `if (next instanceof Node) return;` بس، وهاد بيسأل "هل هو عنصر؟" والجواب دايماً نعم. الشرط الصح بيسأل **سؤالين**: هل هو عنصر؟ (مشان TypeScript) **وهل هو جوّا العمود؟** (المنطق الحقيقي).

> **الطريقة 3:** `instanceof`.
> ⚠️ **لا تحلها بـ `as Node`**، لأنو `as` ما بيفحص شي (شوف س20).

---

### س8: لو ضفت action جديد ونسيت تضيفله `case`، شو بيصير؟
```ts
default: {
  const _exhaustive: never = action;
  throw new Error(`Unknown action: ${JSON.stringify(_exhaustive)}`);
}
```

**الجواب:** TypeScript بيعطي خطأ بسطر `_exhaustive`، لأنو `action` ما عاد نوعه `never` (صار فيه حالة ما انعالجت).

**الشرح:**
- `never` معناها "نوع مستحيل يكون إله قيمة".
- إذا كل الحالات انعالجت، بيوصل `action` للـ `default` بنوع `never`.
- وإذا في حالة ناقصة، بيوصل بنوعها هي، فبيصير خطأ. **وهيك ما بتنسى حالة أبداً.**

**ليش `throw` بدل `return state`؟** إعدادات المشروع بتمنع المتغيرات غير المستعملة. وأصلاً منطقياً، إذا وصلنا لـ action ما منعرفه، فهاد **bug**، ولازم ينكشف بدل ما نسكت عنه.

> **الطريقة 4:** `never` للتحقق الشامل (Exhaustive Check).

---

## 4. الاختياري و`null` و`undefined`

### س9: شو معنى `?` بـ `initialTask?: Task`؟
**الجواب:** الخاصية **اختيارية**، يعني نوعها فعلياً `Task | undefined`.
- **بالتعديل:** منبعت المهمة، فهي موجودة.
- **بالإضافة:** ما منبعت شي، فبتكون `undefined`.

**ونفس الشي** بـ `beforeId?: string`: زر Mark Done بيبعت `id` و`status` بس، وما في اعتراض، لأنو `beforeId` اختياري.

---

### س10: شو بيعمل `??`؟ وشو فرقه عن `||`؟
```ts
initialTask ?? EMPTY_TASK
```

**الجواب:** `??` اسمه **Nullish Coalescing**: إذا يلي عالشمال `null` أو `undefined`، بياخد يلي عاليمين.

| | `"" ?? "x"` | `"" \|\| "x"` | `0 ?? 5` | `0 \|\| 5` |
|---|---|---|---|---|
| النتيجة | `""` | `"x"` | `0` | `5` |

**الشرح:** `||` بيعتبر كمان `""` و`0` و`false` "فاضيين"، أما `??` لأ.

---

### س11: ليش كتبنا `editingTask ?? undefined` بدل `editingTask`؟
**الجواب:**
- `editingTask` نوعها `Task | null`
- `initialTask?` نوعها `Task | undefined`
- **`null` و`undefined` مش نفس الشي بـ TypeScript.**

فـ `?? undefined` بتبدّل الـ `null` بـ `undefined`، فبيصير النوع مطابق.

---

## 5. استنتاج الأنواع (Type Inference)

### س12: ليش ما احتجنا `useState<string>("")` لـ `error`؟
**الجواب:** TypeScript **استنتج** النوع لحاله من القيمة الأولى `""`.

**والقاعدة:**
| الحالة | الحل |
|---|---|
| القيمة الأولى **بتوضّح** النوع | خلّي TypeScript يستنتجه |
| القيمة الأولى **ما بتوضّحه** | اكتبه انت |

```ts
useState("")                     // ✅ string
useState(false)                  // ✅ boolean
useState(null)                   // ❌ النوع رح يصير null للأبد
useState<Task | null>(null)      // ✅
useState<NewTask>(initialTask ?? EMPTY_TASK) // ✅ وإلا بيصير Task | NewTask
```

---

### س13: ليش TypeScript متأكد إنو `column.id` قيمة `Status` صحيحة بـ `onDrop`؟
**الجواب:** لأنو بـ `task.ts` عرّفنا `Column` إنو `id: Status`، و`COLUMNS` نوعها `Column[]`. يعني القيمة **انفحصت مرة وحدة** وقت ما كتبناها، ولو كتبت `"Todo"` بالغلط، كان اعترض هونيك.

> 💡 **الفكرة:** الفحص بيصير **بمكان التعريف**، وبعدها بتوثق بالقيمة بكل مكان.

---

## 6. فحص شكل الـ Object

### س14: الـ state نوعه `NewTask`، بس عطيناه `Task` (فيها خاصيات زيادة). ليش ما اعترض؟
**الجواب:** TypeScript بيفحص **الشكل** مش الاسم، واسمها **Structural Typing**. السؤال يلي بيسأله: "هل فيه **كل** الخاصيات يلي بيحتاجها `NewTask`؟". والجواب نعم، فبيقبل.

**بس انتبه:**
- TypeScript **ما بيشيل** الخاصيات الزيادة فعلياً. يعني `form` فيه `id` و`status` و`createdAt` وقت التشغيل.
- **Excess Property Checking:** لما تكتب object **مباشرة** (literal)، بيكون أشد وبيمنع الزيادة:

```ts
const a: NewTask = { title: "x", priority: "low", id: "1" }; // ❌ خطأ
const b: NewTask = initialTask;                              // ✅ مقبول
```

---

### س15: ليش كتبنا `{ ...data, id: editingTask.id }` مش العكس؟
**الجواب:** **بالـ spread، يلي بيجي آخر بيربح.** و`data` فيها `id` كمان (جاية من الفورم). فلازم `id` الصح ييجي **آخر شي**، مشان يكون هو يلي بيبقى.

---

## 7. وين TypeScript **ما بيحميك**

### س16: ليش ما اعترض TypeScript على `name="descritpion"` (غلطة إملائية)؟
```ts
setForm({ ...form, [e.target.name]: e.target.value });
```

**الجواب:** `[e.target.name]` نوعه `string` عادي. فـ TypeScript **ما بيعرف** أي خاصية عم تتعدّل، فبيوقّف الفحص.

**ونفس السبب**، ما بيقدر يتأكد إنو `priority` قيمتها `"low" | "medium" | "high"`، لأنو `e.target.value` بالنسبة إله `string`.

**الحماية الوحيدة هون:** إنو الـ `name` مكتوب صح، والـ `select` ما فيه غير القيم الصح.

> 💡 **الدرس:** TypeScript قوي، بس لازم تعرف **وين بيوقف فحصه**.

---

### س17: `trim` بدون أقواس
```ts
if (!form.title.trim) { ... }   // ❌ دايماً false
if (!form.title.trim()) { ... } // ✅
```

**الجواب:** بدون `()`، عم تجيب **الدالة نفسها**، مش نتيجتها. والدالة دايماً موجودة، فالشرط عمره ما بيتحقق. ونفس الغلطة صارت مع `crypto.randomUUID`.

> 💡 **عادة مفيدة:** "بدي الدالة نفسها، ولا نتيجتها؟" إذا نتيجتها، فلازم `()`.

---

## 8. React مع TypeScript

### س18: أنواع الأحداث
| الحدث | النوع |
|---|---|
| تغيير حقل | `ChangeEvent<HTMLInputElement \| HTMLTextAreaElement \| HTMLSelectElement>` |
| إرسال فورم | `FormEvent<HTMLFormElement>` |
| سحب وإفلات | `DragEvent<HTMLDivElement>` أو `DragEvent<HTMLElement>` |

```ts
import { useState, type ChangeEvent, type FormEvent, type DragEvent } from "react";
```

- **`HTMLElement`** هو النوع العام، ومنستعمله لعناصر ما إلها نوع خاص (متل `<section>`).
- **إذا كتبت الدالة مباشرة جوّا الـ JSX** (`onClick={(e) => ...}`)، TypeScript بيعرف نوع `e` لحاله. بس إذا كتبتها **برا**، لازم تكتبه انت.
- **`ReactNode`** هو النوع المعتمد لـ `children`: أي شي React بيقدر يعرضه.

---

### س19: ليش زر Cancel لازم يكون `type="button"`؟
**الجواب:** أي زر جوّا `<form>` **نوعه الافتراضي `submit`**. فلو نسيناه، كبسة Cancel رح تبعت الفورم بدل ما تسكّره.

**وبالسحب والإفلات:** المتصفح **افتراضياً بيمنع** الإفلات، فلازم `e.preventDefault()` بـ `onDragOver`، وإلا `onDrop` ما بينادى أبداً.

---

## 9. الـ Generics

### س20: شو هي الـ Generics؟
**الجواب:** **نوع كمتغير**. بدل دالة لكل نوع، بتكتب وحدة، و`T` بيتعبّى حسب الاستعمال:

```ts
function first<T>(arr: T[]): T { return arr[0]; }

first(["a", "b"]); // T = string
first([1, 2]);     // T = number
```

**شفناها كمان بـ:** `useState<Task | null>`، و`closest<HTMLElement>("[data-task-id]")`.

---

### س21: `useLocalStorage("theme", "dark")`: شو هو `T`؟
**الجواب:** `string`. TypeScript **استنتجه** من القيمة `"dark"`.

### س22: ليش `useLocalStorage<Task[]>("tasks", [])` بدّها `<Task[]>`؟
**الجواب:** مع مصفوفة **فاضية**، TypeScript ما بيعرف شو رح يكون جوّاتها، فبيستنتج `never[]` (مصفوفة ما بتقبل ولا شي). نفس فكرة `useState(null)`.

---

### س23: شو بيعمل `as const`؟
```ts
return [value, setValue] as const;
```

**الجواب:** بيحوّل المصفوفة لـ **tuple**: طول ثابت، وكل مكان إله نوعه.

| | النوع |
|---|---|
| **بدون** `as const` | كل عنصر `T \| Dispatch` (مخربط) |
| **مع** `as const` | `[T, Dispatch]` ✅ |

وهاد بالضبط يلي بيعمله `useState` من جوّا.

---

### س24: هل `JSON.parse(stored) as T` آمن؟
**الجواب:** **لأ.** `as` اسمه **Type Assertion**، ومعناه "ثق فيني يا TypeScript"، و**ما بيفحص شي** وقت التشغيل.

**القيمة الابتدائية بترجع بس إذا:**
- ما في شي مخزّن، أو
- الـ JSON مكسور (فبيمسكه الـ `catch`)

**أما إذا كان JSON سليم بس بشكل غلط** (نسخة قديمة، أو تعديل من DevTools)، فبيرجّعه على إنه `T`، والتطبيق بيكرّش بعدين بمكان تاني.

**الحل:** افحص البيانات وقت التشغيل:
```ts
if (!Array.isArray(data)) return [];
```

### س25: هل `Array.isArray` بيضمن إنو كل عنصر هو `Task`؟
**الجواب:** **لأ.** بيضمن إنها **مصفوفة** بس. ممكن تكون مصفوفة أرقام، أو objects ناقصها `title`. للتأكد الكامل لازم تفحص كل عنصر (عنده `id` نص، و`status` من القيم الصح...)، أو تستعمل مكتبة فحص متل **Zod** بالمشاريع الأكبر.

> ⚠️ **القاعدة:** كل ما تشوف `as`، اعرف إنك عم **توقّف حماية TypeScript**. والبيانات الجاية **من برا التطبيق** (localStorage، وAPI، والفورم) لازم تنفحص دايماً.

---

## 10. TypeScript كمساعد بالـ Refactoring

### س26: لما شلنا `markDone`، شو صار؟
**الجواب:** `markDone` كانت بالضبط `onMove(id, "done")`، يعني تكرار. ولما شلناها من interface واحد، **TypeScript دلّنا على كل مكان لسا مستعملها** بخط أحمر.

> 💡 **هاد من أكبر فوايد TypeScript بالمشاريع الكبيرة:** بتغيّر شي، وهو بيقلك وين لازم تكمّل.

---

## 11. JavaScript مفيد تعلمناه بالطريق
| | |
|---|---|
| `find` | بترجّع **العنصر**، أو `undefined` |
| `findIndex` | بترجّع **رقم المكان**، أو `-1` |
| `slice(0, i)` | من الأول **لحد قبل** `i` |
| `slice(i)` | من `i` **للآخر** |
| `[key]: value` | اسم خاصية جاي من متغير |
| `closest(selector)` | بيطلع لفوق لحد أقرب أب مطابق |
| `data-task-id` ← `dataset.taskId` | المتصفح بيحوّل الاسم لـ camelCase |
| `!==` بدل `!=` | دايماً، لأنو بيقارن النوع كمان |

---

## 📋 ورقة مراجعة سريعة
| المفهوم | بسطر |
|---|---|
| **Union** | قائمة قيم مسموحة بس |
| **Record** | object لازم فيه كل المفاتيح |
| **Omit / Partial** | شيل خاصيات / خليها كلها اختيارية |
| **Discriminated Union** | Union بخاصية مميِّزة (`type`) |
| **Narrowing** | `switch`، و`if (x)`، و`instanceof`، و`never` |
| **`?`** | اختياري = `T \| undefined` |
| **`??`** | بديل إذا `null` أو `undefined` بس |
| **Inference** | خلّي TypeScript يستنتج إذا القيمة واضحة |
| **Structural Typing** | الشكل أهم من الاسم |
| **Generics** | نوع كمتغير `<T>` |
| **`as const`** | مصفوفة ← tuple |
| **`as T`** | ⚠️ "ثق فيني"، بدون فحص |
| **`never`** | نوع مستحيل، للتحقق الشامل |
