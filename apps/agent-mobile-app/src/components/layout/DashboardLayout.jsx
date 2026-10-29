import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

export default DashboardLayout;
