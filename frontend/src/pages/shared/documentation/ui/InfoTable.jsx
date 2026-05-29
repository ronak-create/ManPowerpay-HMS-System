export default function InfoTable({ headers = [], rows = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-zinc-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="
                    px-5 py-4
                    text-left
                    text-sm
                    font-semibold
                    text-zinc-700
                  "
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-zinc-200">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="
                      px-5 py-4
                      text-sm text-zinc-600
                    "
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
