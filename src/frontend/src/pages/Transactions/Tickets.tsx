import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TicketCard from "../../components/common/TicketCard";
import { useState } from "react";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

export default function Tickets() {
  const [loading, setLoading] = useState(false)
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <LoadingOverlay open={loading} />
      <PageBreadcrumb pageTitle="List Tickets" />
      <div className="space-y-6">
        <ComponentCard title="List Tickets">
          <TicketCard setLoading={setLoading}/>
        </ComponentCard>
      </div>
    </>
  );
}
