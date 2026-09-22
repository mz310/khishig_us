// Shown instantly while an admin page renders on the server.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Ачаалж байна" className="loading">
      <div className="skel" style={{ height: 30, width: "40%", margin: "22px 20px 16px" }} />
      <div className="mx tiles">
        <div className="skel" style={{ height: 90 }} /><div className="skel" style={{ height: 90 }} />
        <div className="skel" style={{ height: 90 }} /><div className="skel" style={{ height: 90 }} />
      </div>
      <div className="skel mx" style={{ height: 130, marginTop: 18 }} />
      <div className="skel mx" style={{ height: 130, marginTop: 10 }} />
    </div>
  );
}
