const { useState, useRef, useMemo, useEffect } = React;

const ITEM_HEIGHT = 60;
const LIST_LENGTH = 100000;

function App() {
  const [list] = useState(
    new Array(LIST_LENGTH).fill(0).map((_, idx) => ({ idx: idx + 1 }))
  );
  return (
    <div>
      <VirtualList list={list} itemHeight={ITEM_HEIGHT}></VirtualList>
    </div>
  );
}

// react-virtualized https://github.com/bvaughn/react-virtualized
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

ReactDOM.render(<App />, document.querySelector("#app"));
