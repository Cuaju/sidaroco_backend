const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL;
if (!MAIL_SERVICE_URL) throw new Error("MAIL_SERVICE_URL is missing");

export async function sendTicketEmail(
  to: string,
  ticketData: {
    routeName: string;
    travelDate: string;
    travelTime: string;
    tickets: Array<{ id: number; seatNumber: number; price: number }>;
    passengerName: string;
    totalPrice: number;
  }
) {
    const res = await fetch(`${MAIL_SERVICE_URL}/mail/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject: `Your SIDAROCO tickets - $${ticketData.totalPrice}`,
        template: "ticket",
        context: {
            routeName: ticketData.routeName,
            travelDate: ticketData.travelDate,
            travelTime: ticketData.travelTime,
            tickets: ticketData.tickets,
            passengerName: ticketData.passengerName || "Guest",
            totalPrice: ticketData.totalPrice,
        },
      }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(`Failed to send email: ${data.message || "mail service error"}`);
    }

    return { success: true };
}
