import { Fragment, useReducer } from "react";

export default function Table({ data = [] }) {
  const initialState = {
    data: data,
    sorts: {},
    filters: {
      name: "",
      date: null,
      ad: "",
      field: "",
    },
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case 'FILTER': {
        return { ...state, filters: {...state.filters, [action.name]: action.value} };
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log(state);
  return (
    <Fragment>
      <article style={{ display: "flex" }}>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="name">نام</label>
          <input
            type="text"
            name="name"
            id="name"
            value={state.name}
            onChange={(e) =>
              dispatch({
                type: "FILTER",
                name: "name",
                value: e.target.value,
              })
            }
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="date">تاریخ</label>
          <input
            type="text"
            name="date"
            id="date"
            value={state.date}
            onChange={(e) =>
              dispatch({
                type: "FILTER",
                name: "date",
                value: e.target.value,
              })
            }
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="post">آگهی</label>
          <input
            type="text"
            name="ad"
            id="ad"
            value={state.ad}
            onChange={(e) =>
              dispatch({
                type: "FILTER",
                name: "ad",
                value: e.target.value,
              })
            }
          />
        </section>
        <section style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="field">فیلد</label>
          <input
            type="text"
            name="field"
            id="field"
            value={state.date}
            onChange={(e) =>
              dispatch({
                type: "FILTER",
                name: "field",
                value: e.target.value,
              })
            }
          />
        </section>
      </article>
      <table>
        <thead>
          <tr>
            <th>نام</th>
            <th>تاریخ</th>
            <th>آگهی</th>
            <th>فیلد</th>
            <th>مقدار قدیمی</th>
            <th>مقدار جدید</th>
          </tr>
        </thead>
        <tbody>
          {state.data.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.date}</td>
              <td>{row.title}</td>
              <td>{row.field}</td>
              <td>{row.old_value}</td>
              <td>{row.new_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
}
