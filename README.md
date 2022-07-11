# 虚拟滚动的三种实现思路

# 1 前言
在`web`开发的过程中，或多或少都会遇到大列表渲染的场景，例如全国城市列表、通讯录列表、聊天记录列表等等。当列表数据量为几百条时，依靠浏览器本身的性能基本可以支撑，一般不会出现卡顿的情况。但当列表数量级达到上千，页面渲染或操作就可能会出现卡顿，而当列表数量突破上万甚至十几万时，网页可能会出现严重卡顿甚至直接崩溃。为了解决大列表造成的渲染压力，便出现了虚拟滚动技术。本文主要介绍虚拟滚动的基本原理，以及子项定高的虚拟滚动列表的简单实现。
# 2 基本原理
首先来看一下直接渲染的大列表的实际表现。以有10万条子项的简单大列表为例，页面初始化时，`FP`时间大概在4000ms左右，大量的时间被用于执行脚本和渲染。而当快速滚动列表时，网页的`FPS`维持在35左右，可以明显的感觉到页面的卡顿。借助谷歌`Lighthouse`工具，最终网页的性能得分仅为49。通过实际访问体验和性能相关数据可以看出，直接渲染的大列表在加载操作方面体验是十分糟糕的。点击[链接](https://youthfighter.github.io/react-virtual-list/list.html)，体验实际效果。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657519973786-e8598327-9e56-47ad-ab5f-a75288ba3528.png#clientId=ua6d19077-be90-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=307&id=u72fda2a3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=307&originWidth=480&originalType=binary&ratio=1&rotation=0&showTitle=false&size=22212&status=done&style=none&taskId=u1194bfba-d40b-4def-a47a-cc939776e2f&title=&width=480)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657521496025-8a9db830-feb5-4144-b3dd-37d6527897ea.png#clientId=ua6d19077-be90-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=254&id=u17cd5df7&margin=%5Bobject%20Object%5D&name=image.png&originHeight=254&originWidth=414&originalType=binary&ratio=1&rotation=0&showTitle=false&size=12871&status=done&style=none&taskId=u3e5bd203-f674-4a36-b2a7-118c972f405&title=&width=414)

通过以上的测试数据可以看到，在页面初始化时脚本的执行和`DOM`渲染占据的大部分的时间。而随着列表子项的减少，页面初始化时间会变短并且滚动时`FPS`可以保持在60。由此可以得出结论大量节点的渲染是页面初始化慢和操作卡顿的主要原因。
虽然大列表的数据量很大，但是设备的显示区域是有限的，也就是说在同一时间，用户看到的内容是有限的。利用这一特点，可以将大列表**按需渲染**。也就是只渲染某一时刻用户看的到的内容，当用户滚动页面时，再通过`JS`的计算重现调整视窗内的内容，这样可以把列表子项的数量级别从几万降到几十。
![虚拟滚动-原理.drawio.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657511754129-bf130719-2a1b-4e83-9b9e-c2257f73aa93.png#clientId=u8a6f152d-eaac-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=562&id=uf75df66c&margin=%5Bobject%20Object%5D&name=%E8%99%9A%E6%8B%9F%E6%BB%9A%E5%8A%A8-%E5%8E%9F%E7%90%86.drawio.png&originHeight=562&originWidth=1522&originalType=binary&ratio=1&rotation=0&showTitle=false&size=160752&status=done&style=none&taskId=u68700336-6b3b-422d-8c3e-2653a448148&title=&width=1522)
借助按需渲染的思想来优化大列表在实现层面可以分成三步，一是确定当前视窗在哪，二是确定当前要真实渲染哪些节点，三是把渲染的节点移动到视窗内。对于问题一，视窗的位置对于长列表来说，其开始位置为列表滚动区域的`scrollTop`。对于问题二，按照视窗外内容不渲染的思路，则应该渲染数组索引从`Math.floor(scrollTop/itemHeight)`开始共`Math.ceil(viewHeight/itemHeight)`个元素。对于问题三，有多种实现思路，以下将介绍几种常见虚拟滚动的实现方式。

> ✨解释：
> - scrollTop：列表滚动区域的scrollTop
> - itemHeight：子节点的高度
> - viewHeight：视窗的高度

# 3 实现
## 3.1 Transform
该方案主要是通过监听滚动区域的滚动事件，动态计算视窗内渲染节点的开始索引以及偏移量，然后重新触发渲染节点的渲染并将内容通过`transform`属性将该部分内容移动到视窗内。
![虚拟滚动-translate.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657457797924-98590148-9b04-4414-bc70-7685bb836121.png#clientId=uadbf3e4d-f0a4-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=622&id=udf00c452&margin=%5Bobject%20Object%5D&name=%E8%99%9A%E6%8B%9F%E6%BB%9A%E5%8A%A8-translate.png&originHeight=622&originWidth=860&originalType=binary&ratio=1&rotation=0&showTitle=false&size=103564&status=done&style=none&taskId=u856a919c-9c20-4174-b876-f06f6ec4371&title=&width=860)
简单代码实现如下，[线上效果预览](https://youthfighter.github.io/react-virtual-list/transform.html)。
```jsx
function VirtualList(props) {
  const { list, itemHeight } = props;
  const [start, setStart] = useState(0);
  const [count, setCount] = useState(0);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const totalHeight = useMemo(() => itemHeight * list.length, [list.length]);
  useEffect(() => {
    setCount(Math.ceil(scrollRef.current.clientHeight / itemHeight));
  }, []);
  const scrollHandle = () => {
    const { scrollTop } = scrollRef.current;
    const newStart = Math.floor(scrollTop / itemHeight);
    setStart(newStart);
    contentRef.current.style.transform = `translate3d(0, ${
      newStart * itemHeight
    }px, 0)`;
  };
  const subList = list.slice(start, start + count);
  return (
    <div className="virtual-list" onScroll={scrollHandle} ref={scrollRef}>
      <div style={{ height: totalHeight + "px" }}>
        <div className="content" ref={contentRef}>
          {subList.map(({ idx }) => (
            <div
              key={idx}
              className="item"
              style={{ height: itemHeight + "px" }}
            >
              {idx}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

```
> ✨类似思想实现的开源项目：[react-list](https://github.com/caseywebdev/react-list)

## 3.2 Absolute
该方案与`transform`方案类似，都是通过监听滚动区域的滚动事件，动态的计算要显示的内容。但`transform`方案显示内容的偏量是动态计算并赋值的，而该方案则是利用`absolute`属性直接将待渲染的节点定位到其该出现的位置。例如，索引为0的元素，其必定在`top = 0 * itemHeight`的位置，索引为`start`的元素必定在`top = start * itemHeight`的位置，这与视窗位置无关。视窗只决定了要渲染那些子节点，不影响子节点的相对位置。
![虚拟滚动-ABSOLUTE.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657457788782-a986cd1e-33e2-4ad6-b1a6-d3c593a473f7.png#clientId=uadbf3e4d-f0a4-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=664&id=uba46c7ef&margin=%5Bobject%20Object%5D&name=%E8%99%9A%E6%8B%9F%E6%BB%9A%E5%8A%A8-ABSOLUTE.png&originHeight=664&originWidth=922&originalType=binary&ratio=1&rotation=0&showTitle=false&size=118470&status=done&style=none&taskId=ua1424dac-16ea-4b0f-b7f9-e685db10fde&title=&width=922)
简单代码实现如下，[线上效果预览](https://youthfighter.github.io/react-virtual-list/absolute.html)。
```jsx
function VirtualList(props) {
  const { list, itemHeight } = props;
  const [start, setStart] = useState(0);
  const [count, setCount] = useState(0);
  const scrollRef = useRef(null);
  const totalHeight = useMemo(() => itemHeight * list.length, [list.length]);
  useEffect(() => {
    setCount(Math.ceil(scrollRef.current.clientHeight / itemHeight));
  }, []);
  const scrollHandle = () => {
    const { scrollTop } = scrollRef.current;
    const newStart = Math.floor(scrollTop / itemHeight);
    setStart(newStart);
  };
  const subList = list.slice(start, start + count);
  return (
    <div className="virtual-list" onScroll={scrollHandle} ref={scrollRef}>
      <div style={{ height: `${totalHeight}px` }}>
        {subList.map(({ idx }) => (
          <div
            key={idx}
            className="item"
            style={{
              position: "absolute",
              width: "100%",
              height: itemHeight + "px",
              top: `${(idx - 1) * itemHeight}px`,
            }}
          >
            {idx}
          </div>
        ))}
      </div>
    </div>
  );
}
```
> ✨类似思想实现的开源项目：[react-virtualized](https://github.com/bvaughn/react-virtualized)

## 3.3 Padding
该方案与以上两种方案有较大的差别，主要体现在以下两点：一是列表高度撑起的方式不同，以上两种方案的高度是通过设置`height = list.length * itemHeight`的方式撑起来的，而该方案则是通过`paddingTop + paddingBottom + renderHeight`的方式来撑起来的。二是列表的重新渲染时机不同，以上两种方案会在`Math.floor(scrollTop / itemHeight)`值变化时重新渲染，而该方案则是在渲染节点"不够"在视窗内显示时触发。
举个例子，假定视窗一次可以显示10个，同时配置虚拟滚动组件一次渲染50节点，那么当屏幕滚动到第11个时并不需要渲染，因为此时显示的是11-20个节点，而将要显示的21-50已经渲染好了。只有当滚动到第41个的时候才需要重新渲染，因为屏幕外已经没有渲染好的节点了，再滚动就要显示白屏了。根据以上例子进一步的分析临界条件，当前渲染位置为`[itemHeight * start, itemHeight * (start + count)]`，视窗显示的位置为`[scrollTop, scrollTop + clientHeight]`。

- 当`scrollTop + clientHeight >= itemHeight * (start + count)`时，说明视窗显示位置超过了渲染的最大位置，重新触发渲染调整渲染位置，避免底部白屏。
- 当`scrollTop <= itemHeight * start`时，说明视窗显示位置不足渲染的最小位置，重新触发渲染调整渲染位置，避免顶部白屏。

![虚拟滚动-padding.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657457724414-3250075a-d20a-436d-87d5-5b6536d7fa24.png#clientId=uadbf3e4d-f0a4-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=674&id=uc68fddca&margin=%5Bobject%20Object%5D&name=%E8%99%9A%E6%8B%9F%E6%BB%9A%E5%8A%A8-padding.png&originHeight=674&originWidth=992&originalType=binary&ratio=1&rotation=0&showTitle=false&size=135243&status=done&style=none&taskId=u8138c19c-6478-4519-bd15-cd66038c897&title=&width=992)
简单代码实现如下，[线上效果预览](https://youthfighter.github.io/react-virtual-list/padding.html)。
```jsx
function VirtualList(props) {
  // 注意该count是外部传入的
  const { list, itemHeight, count } = props;
  const totalHeight = useMemo(() => itemHeight * list.length, [list.length]);
  const currentHeight = useMemo(() => itemHeight * count, [itemHeight, count]);
  const [start, setStart] = useState(0);
  const scrollRef = useRef(null);
  const paddingTop = useMemo(() => itemHeight * start, [start]);
  const paddingBottom = useMemo(
    () => totalHeight - itemHeight * start - currentHeight,
    [start]
  );
  const scrollHandle = () => {
    const { scrollTop, clientHeight } = scrollRef.current;
    if (
      scrollTop + clientHeight >= itemHeight * (start + count) ||
      scrollTop <= itemHeight * start
    ) {
      const newStart = Math.floor(scrollTop / itemHeight);
      setStart(Math.min(list.length - count, newStart));
    }
  };
  const subList = list.slice(start, start + count);
  return (
    <div className="virtual-list" onScroll={scrollHandle} ref={scrollRef}>
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
        }}
      >
        {subList.map(({ idx }) => (
          <div key={idx} className="item" style={{ height: itemHeight + "px" }}>
            {idx}
          </div>
        ))}
      </div>
    </div>
  );
}
```
> ✨类似思想实现的开源项目：[vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list)

# 4 性能
使用以上三种方案分别测试页面加载速度和滚动时的`FPS`发现，三者之间的性能数据无明显差别。页面初始化时，`FP`时间提前到450ms左右，快速滚动时的`FPS`基本稳定在60左右，网站的谷歌`Lighthouse`性能跑分提高到95左右。实际访问体验和性能相关数据都得到了较大的提升。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657520635425-df010c66-4005-43f2-96e0-43335ff50db7.png#clientId=ua6d19077-be90-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=250&id=uc9553b12&margin=%5Bobject%20Object%5D&name=image.png&originHeight=311&originWidth=435&originalType=binary&ratio=1&rotation=0&showTitle=false&size=20547&status=done&style=none&taskId=u676371cd-9413-42ed-a8f4-872bcb0b23c&title=&width=350)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/580982/1657521471589-8a8fd71c-6668-4a33-a830-a2ec9473b664.png#clientId=ua6d19077-be90-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=261&id=uf525d722&margin=%5Bobject%20Object%5D&name=image.png&originHeight=261&originWidth=422&originalType=binary&ratio=1&rotation=0&showTitle=false&size=14436&status=done&style=none&taskId=ud16aafeb-a8e3-48ca-b0db-8bb01413579&title=&width=422)
# 5 总结
本文主要是介绍了虚拟滚动的基本原理，并根据常见虚拟滚动开源库的实现思路使用`react`进行了简单的实现。通过简单的实现可以帮助我们更好的理解虚拟滚动原理，不过在实际开发过程中，还是建议大家使用成熟的开源库。

