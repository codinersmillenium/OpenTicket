import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import EventCard from "../../components/common/EventCard";
import { FolderIcon } from "../../icons";
import { useState,useEffect } from "react";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { getPrincipal, initActor } from "../../lib/canisters";
import { formatCurrency, formatDate, formatDay } from "../../lib/utils";
import { Modal } from "../../components/ui/modal";
import EventDetail from "../../components/common/EventDetail";
import PaymentMethod from "../../components/common/PaymentMethod";

export default function Events() {
  const [loading, setLoading] = useState(false)
  const [modal, setModal]: any = useState(false)
  const [events, setEvents]: any = useState([])
  const [eventDetail, setEventDetail]: any = useState({})
  const [paymentMethodModal, setPaymentMethodModal]: any = useState(false)
  const [order, setOrder]: any = useState()

  const getEvents = async (id = 0) => {
    setLoading(true)
    try {
      const actor = await initActor('event')
      const { ok } = await actor.getEvents(id)
      let rows = []
      if (id === 0) {
        for (let i in ok) {
          const dateStart = new Date(Number(ok[i].dateStart) * 1000)
          const row = {
            id: ok[i].id,
            title: ok[i].name,
            image: (ok[i].image[0] ? ok[i].image[0] : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3"),
            date: formatDate(dateStart),
            dayOfWeek: formatDay(dateStart),
            location: "Innovation Center",
            price:(ok[i].seat.length > 0 ? formatCurrency(ok[i].seat[0].priceTicket, 'IDR') : null),
            category: ok[i].tags,
            description: ok[i].desc
          }
          rows.push(row)
        }
        setEvents(rows)
      } else {
        if (ok.length > 0) {
          setEventDetail(ok[0])
          setModal(true)
        }
      }
    } catch (error) {
      setLoading(false)
    }
    setLoading(false)
  };
  useEffect(() => {
    getEvents()
  }, [])

  const bookEvent = async () => {
    setLoading(true)
    try {
      const actor = await initActor('trx')
      const total = Number(eventDetail.seat[0].priceTicket)
      const formData = {
        seatId: Number(eventDetail.seat[0].id),
        total: total + Math.round((2 * total / 100)),
        payMethod : []
      }
      const principal = await getPrincipal()
      const invoice = await actor.getInvoiceByUser(principal[1], formData.seatId)
      if (invoice?.ok.length > 0) {
        setOrder(invoice?.ok[0])
      } else {
        const { ok } = await actor.createInvoice(formData)
        setOrder(ok)
      }
      setPaymentMethodModal(true)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <LoadingOverlay open={loading} />
      <PageBreadcrumb pageTitle="List Events" />
      <div className="space-y-6">
        <ComponentCard title="List Events">
          <Modal
            isOpen={modal}
            onClose={() => setModal(false)}
            className="mx-4 w-auto p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <EventDetail setEventDetail={setEventDetail} eventDetail={eventDetail} bookEvent={bookEvent}/>
            </div>
          </Modal>
          <div className="flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300 flex">
              <FolderIcon className="mt-1 mr-2"/>
              <span>Your Ticket</span>
            </button>
          </div>
          <EventCard getEvents={getEvents} events={events}/>
        </ComponentCard>
        <PaymentMethod isModalOpen={paymentMethodModal} setIsModalOpen={setPaymentMethodModal} item={order} detail={eventDetail} setLoading={setLoading}/>
      </div>
    </>
  );
}
