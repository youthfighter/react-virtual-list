const { useState, useRef, useMemo, useEffect } = React;

const ITEM_HEIGHT = 60;
const LIST_LENGTH = 100000;

function App() {
  const [list] = useState(
    new Array(LIST_LENGTH).fill(0).map((_, idx) => ({ idx: idx + 1 }))
  );
  return (
    <div>
      <VirtualList
        list={list}
        itemHeight={ITEM_HEIGHT}
        count={30}
      ></VirtualList>
    </div>
  );
}

// vue-virtual-scroll-list https://github.com/tangbc/vue-virtual-scroll-list
function VirtualList(props) {
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

ReactDOM.render(<App />, document.querySelector("#app"));
