const { useState, useRef, useMemo, forwardRef } = React;
const List = forwardRef(({ list, itemHeight }, ref) => {
  return (
    <div className="list" ref={ref}>
      {list.map(({ idx }) => (
        <div
          key={idx}
          className="item"
          style={{ height: itemHeight + "px" }}
        >
          {idx}
        </div>
      ))}
    </div>
  );
});

function App() {
  const [list] = useState(
    new Array(100000)
      .fill(0)
      .map((_, idx) => ({ idx: idx + 1 }))
  );
  return (
    <div>
      <List list={list} itemHeight={60}></List>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
