import mongooseConnect from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/authOptions";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import sendEmail from "@/constants/sendEmail";
import { render } from "@react-email/render";
import TransactionEmail from "@/email-templates/TransactionEmail";
import Company from "@/models/Company";

interface BodyProps {
  transactionId: string;
  note?: string;
}

// Protectected route for admin
export const POST = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("UnAuthorized Access");
    await mongooseConnect();
    //code logic

    const companies = await Company.find({});
    const company: CompanyProps | null = companies[0];
    if (!company) throw new Error("No Comany info");

    const body: BodyProps = await request.json();
    const transaction = await Transaction.findById(body.transactionId);
    if (!transaction) throw new Error("No Transaction found");

    await Transaction.findByIdAndUpdate(body.transactionId, {
      status: "rejected",
      note: body.note || transaction.note || undefined,
    });

    //Sending email
    const updatedTransaction = await Transaction.findById<TransactionProps>(
      body.transactionId
    );
    if (!updatedTransaction) throw new Error("No updated transaction found");

    const transactionOwner = await User.findById<userSchemaType>(
      updatedTransaction.userId
    );
    if (!transactionOwner) throw new Error("No Transaction owner found");

    const emailText =
      body.note ||
      "Your Transaction has being declined for some reason we can't state. If You feel unsatisfied, reach out to our support for more details.";
    const emailHtml = render(
      TransactionEmail({
        transaction: updatedTransaction,
        description: emailText,
        fullname: transactionOwner.fullname,
        company,
      })
    );

    await sendEmail(
      transactionOwner.email,
      `${updatedTransaction.title} declined`,
      emailText,
      await emailHtml,
      company
    );

    return NextResponse.json({ message: "success" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
};
